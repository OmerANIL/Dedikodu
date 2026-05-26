import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGossipDto } from './dto/create-gossip.dto';
import { GossipQueryDto } from './dto/gossip-query.dto';

@Injectable()
export class GossipService {
  private readonly logger = new Logger(GossipService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGossipDto) {
    const neighborhood = await this.prisma.neighborhood.findUnique({
      where: { id: dto.neighborhoodId },
      include: { district: { include: { province: true } } },
    });
    if (!neighborhood) throw new NotFoundException('Neighborhood not found');

    const gossip = await this.prisma.gossip.create({
      data: {
        userId,
        neighborhoodId: dto.neighborhoodId,
        content: dto.content,
      },
      include: {
        author: { select: { nickname: true } },
        neighborhood: { include: { district: { include: { province: true } } } },
      },
    });

    this.logger.log(`Gossip created by user ${userId}`);
    return {
      id: gossip.id,
      content: gossip.content,
      status: gossip.status,
      neighborhoodId: gossip.neighborhoodId,
      neighborhoodName: gossip.neighborhood.name,
      districtName: gossip.neighborhood.district.name,
      provinceName: gossip.neighborhood.district.province.name,
      authorNickname: gossip.author.nickname,
      createdAt: gossip.createdAt.toISOString(),
    };
  }

  async findAll(query: GossipQueryDto, currentUserId?: string) {
    const { provinceId, districtId, neighborhoodId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: 'approved' as const };

    if (neighborhoodId) {
      where.neighborhoodId = neighborhoodId;
    } else if (districtId) {
      where.neighborhood = { districtId };
    } else if (provinceId) {
      where.neighborhood = { district: { provinceId } };
    }

    const [items, total] = await Promise.all([
      this.prisma.gossip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { nickname: true } },
          neighborhood: { include: { district: { include: { province: true } } } },
          reactions: true,
        },
      }),
      this.prisma.gossip.count({ where }),
    ]);

    const formattedItems = items.map((g: any) => {
      const approveCount = g.reactions.filter((r: any) => r.reactionType === 'approve').length;
      const disapproveCount = g.reactions.filter((r: any) => r.reactionType === 'disapprove').length;
      const userReaction = currentUserId
        ? g.reactions.find((r: any) => r.userId === currentUserId)?.reactionType ?? null
        : null;

      return {
        id: g.id,
        content: g.content,
        status: g.status,
        neighborhoodName: g.neighborhood.name,
        districtName: g.neighborhood.district.name,
        provinceName: g.neighborhood.district.province.name,
        authorNickname: g.author.nickname,
        createdAt: g.createdAt.toISOString(),
        approveCount,
        disapproveCount,
        userReaction,
      };
    });

    return {
      items: formattedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const gossip = await this.prisma.gossip.findUnique({
      where: { id },
      include: {
        author: { select: { nickname: true } },
        neighborhood: { include: { district: { include: { province: true } } } },
        reactions: true,
      },
    });
    if (!gossip) throw new NotFoundException('Gossip not found');

    const approveCount = gossip.reactions.filter((r: any) => r.reactionType === 'approve').length;
    const disapproveCount = gossip.reactions.filter((r: any) => r.reactionType === 'disapprove').length;
    const userReaction = currentUserId
      ? gossip.reactions.find((r: any) => r.userId === currentUserId)?.reactionType ?? null
      : null;

    return {
      id: gossip.id,
      content: gossip.content,
      status: gossip.status,
      neighborhoodName: gossip.neighborhood.name,
      districtName: gossip.neighborhood.district.name,
      provinceName: gossip.neighborhood.district.province.name,
      authorNickname: gossip.author.nickname,
      createdAt: gossip.createdAt.toISOString(),
      approvedAt: gossip.approvedAt?.toISOString() ?? null,
      approveCount,
      disapproveCount,
      userReaction,
    };
  }
}
