import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GossipModule } from './gossip/gossip.module';
import { ReactionModule } from './reaction/reaction.module';
import { ModerationModule } from './moderation/moderation.module';
import { AdminModule } from './admin/admin.module';
import { LocationModule } from './location/location.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ModerationModule,
    GossipModule,
    ReactionModule,
    AdminModule,
    LocationModule,
    MailModule,
  ],
})
export class AppModule {}
