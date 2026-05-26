import { Controller, Post, Get, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GossipService } from './gossip.service';
import { CreateGossipDto } from './dto/create-gossip.dto';
import { GossipQueryDto } from './dto/gossip-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoldOrPlatinumGuard } from '../auth/guards/gold-or-platinum.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@ApiTags('Gossips')
@Controller('api/gossips')
export class GossipController {
  constructor(private gossipService: GossipService) {}

  @Post()
  @UseGuards(JwtAuthGuard, GoldOrPlatinumGuard, EmailVerifiedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a gossip (Gold/Platinum + verified email)' })
  async create(@Request() req: any, @Body() dto: CreateGossipDto) {
    return this.gossipService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List approved gossips with location filtering' })
  async findAll(@Request() req: any, @Query() query: GossipQueryDto) {
    return this.gossipService.findAll(query, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single gossip' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.gossipService.findOne(id, req.user.id);
  }
}
