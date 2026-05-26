import { Controller, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reactions')
@Controller('api/gossips/:id/react')
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update reaction on a gossip' })
  async react(
    @Request() req: any,
    @Param('id') gossipId: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.reactionService.react(gossipId, req.user.id, dto.reactionType);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove own reaction from a gossip' })
  async removeReaction(@Request() req: any, @Param('id') gossipId: string) {
    return this.reactionService.removeReaction(gossipId, req.user.id);
  }
}
