import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    const mailOptions = {
      from: `"Dedikodu App" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject: 'Dedikodu Uygulaması - E-posta Doğrulama',
      text: `Merhaba, Dedikodu uygulamasına hoş geldiniz! Doğrulama kodunuz: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <h2 style="color: #F97316;">Dedikodu App</h2>
          <p>Merhaba, uygulamamıza hoş geldiniz!</p>
          <p>Hesabınızı doğrulamak için aşağıdaki kodu kullanabilirsiniz:</p>
          <h1 style="background: #F5F2EB; display: inline-block; padding: 10px 20px; border-radius: 8px; letter-spacing: 5px;">${code}</h1>
          <p>Bu kod 15 dakika boyunca geçerlidir.</p>
        </div>
      `,
    };

    try {
      if (this.configService.get<string>('SMTP_USER')) {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Verification email sent to: ${to}`);
      } else {
        this.logger.warn('SMTP_USER is not set. Skipped sending email. Verification Code: ' + code);
      }
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error.stack);
    }
  }
}
