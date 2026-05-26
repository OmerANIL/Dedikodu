import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name);

  constructor(private prisma: PrismaService) {}

  private async getReactionCounts(gossipId: string) {
    const [approveCount, disapproveCount] = await Promise.all([
      this.prisma.reaction.count({ where: { gossipId, reactionType: 'approve' } }),
      this.prisma.reaction.count({ where: { gossipId, reactionType: 'disapprove' } }),
    ]);
    return { approveCount, disapproveCount };
  }

  async react(gossipId: string, userId: string, reactionType: 'approve' | 'disapprove') {
    const gossip = await this.prisma.gossip.findUnique({ where: { id: gossipId } });
    if (!gossip) throw new NotFoundException('Gossip not found');

    // Upsert reaction (create or update)
    await this.prisma.reaction.upsert({
      where: { gossipId_userId: { gossipId, userId } },
      update: { reactionType },
      create: { gossipId, userId, reactionType },
    });

    const counts = await this.getReactionCounts(gossipId);

    // Auto-remove if disapproves >= 20
    let removed = false;
    if (counts.disapproveCount >= 20 && gossip.status !== 'removed') {
      await this.prisma.gossip.update({
        where: { id: gossipId },
        data: { status: 'removed' },
      });
      removed = true;
      this.logger.warn(`Gossip ${gossipId} auto-removed due to ${counts.disapproveCount} disapproves`);
    }

    return {
      approveCount: counts.approveCount,
      disapproveCount: counts.disapproveCount,
      userReaction: reactionType,
      removed,
    };
  }

  async removeReaction(gossipId: string, userId: string) {
    const gossip = await this.prisma.gossip.findUnique({ where: { id: gossipId } });
    if (!gossip) throw new NotFoundException('Gossip not found');

    try {
      await this.prisma.reaction.delete({
        where: { gossipId_userId: { gossipId, userId } },
      });
    } catch {
      // Reaction doesn't exist, that's fine
    }

    const counts = await this.getReactionCounts(gossipId);
    return {
      approveCount: counts.approveCount,
      disapproveCount: counts.disapproveCount,
      userReaction: null,
    };
  }
}
