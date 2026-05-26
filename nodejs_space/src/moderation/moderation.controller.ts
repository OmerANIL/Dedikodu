import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { ModerateDto } from './dto/moderate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatinumGuard } from '../auth/guards/platinum.guard';

@ApiTags('Moderation')
@Controller('api/gossips')
@UseGuards(JwtAuthGuard, PlatinumGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending gossips (Platinum only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPending(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.findPending(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch(':id/moderate')
  @ApiOperation({ summary: 'Approve or reject a gossip (Platinum only)' })
  async moderate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ModerateDto,
  ) {
    return this.moderationService.moderate(id, req.user.id, dto.action);
  }
}
