import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(private prisma: PrismaService) {}

  async findPending(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { status: 'pending' as const };

    const [items, total] = await Promise.all([
      this.prisma.gossip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { nickname: true } },
          neighborhood: { include: { district: { include: { province: true } } } },
        },
      }),
      this.prisma.gossip.count({ where }),
    ]);

    return {
      items: items.map((g: any) => ({
        id: g.id,
        content: g.content,
        status: g.status,
        neighborhoodName: g.neighborhood.name,
        districtName: g.neighborhood.district.name,
        provinceName: g.neighborhood.district.province.name,
        authorNickname: g.author.nickname,
        createdAt: g.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async moderate(gossipId: string, moderatorId: string, action: 'approve' | 'reject') {
    const gossip = await this.prisma.gossip.findUnique({ where: { id: gossipId } });
    if (!gossip) throw new NotFoundException('Gossip not found');
    if (gossip.status !== 'pending') throw new BadRequestException('Only pending gossips can be moderated');

    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = await this.prisma.gossip.update({
      where: { id: gossipId },
      data: {
        status,
        moderatorId,
        approvedAt: action === 'approve' ? new Date() : null,
      },
    });

    this.logger.log(`Gossip ${gossipId} ${action}d by moderator ${moderatorId}`);
    return {
      id: updated.id,
      status: updated.status,
      approvedAt: updated.approvedAt?.toISOString() ?? null,
    };
  }
}
