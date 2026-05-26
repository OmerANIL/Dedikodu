import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalGossips, pendingGossips, approvedGossips, rejectedGossips, removedGossips] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.gossip.count(),
        this.prisma.gossip.count({ where: { status: 'pending' } }),
        this.prisma.gossip.count({ where: { status: 'approved' } }),
        this.prisma.gossip.count({ where: { status: 'rejected' } }),
        this.prisma.gossip.count({ where: { status: 'removed' } }),
      ]);

    return { totalUsers, totalGossips, pendingGossips, approvedGossips, rejectedGossips, removedGossips };
  }

  async listUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nickname: true,
          email: true,
          subscriptionLevel: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u: any) => ({ ...u, createdAt: u.createdAt.toISOString() })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        fullName: true,
        email: true,
        phone: true,
        subscriptionLevel: true,
        emailVerified: true,
        isSuperuser: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  async updateSubscription(userId: string, subscriptionLevel: 'basic' | 'gold' | 'platinum') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionLevel },
    });

    this.logger.log(`User ${userId} subscription changed to ${subscriptionLevel}`);
    return {
      id: updated.id,
      nickname: updated.nickname,
      subscriptionLevel: updated.subscriptionLevel,
    };
  }
}
