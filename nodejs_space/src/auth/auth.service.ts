import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      nickname: user.nickname,
      subscriptionLevel: user.subscriptionLevel,
      isSuperuser: user.isSuperuser,
      emailVerified: user.emailVerified,
    };
  }

  async signup(dto: SignupDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email already in use');

    const existingNickname = await this.prisma.user.findUnique({ where: { nickname: dto.nickname } });
    if (existingNickname) throw new ConflictException('Nickname already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await this.prisma.user.create({
      data: {
        nickname: dto.nickname,
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    const token = this.jwtService.sign({ sub: user.id });
    this.logger.log(`User signed up: ${user.email}`);

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, verificationCode);

    return {
      token,
      user: this.formatUser(user),
      // We don't return the code to the client anymore for security reasons
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id });
    this.logger.log(`User logged in: ${user.email}`);

    return {
      token,
      user: this.formatUser(user),
    };
  }

  async verifyEmail(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) return { success: true, message: 'Email already verified' };
    if (!user.verificationCode) throw new BadRequestException('No verification code found. Request a new one.');
    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }
    if (user.verificationCode !== code) throw new BadRequestException('Invalid verification code');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    this.logger.log(`Email verified for user: ${user.email}`);
    return { success: true, message: 'Email verified successfully' };
  }

  async sendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) return { success: true, message: 'Email already verified' };

    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationCode);

    this.logger.log(`Verification code resent for user: ${user.email}`);
    return { success: true, message: 'Verification code sent' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const gossipCount = await this.prisma.gossip.count({ where: { userId } });
    const approvedGossipCount = await this.prisma.gossip.count({ where: { userId, status: 'approved' } });

    return {
      user: {
        ...this.formatUser(user),
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        gossipCount,
        approvedGossipCount,
      },
    };
  }
}
