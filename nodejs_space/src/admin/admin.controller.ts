import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperuserGuard } from '../auth/guards/superuser.guard';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, SuperuserGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (Superuser only)' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (Superuser only)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details (Superuser only)' })
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update user subscription level (Superuser only)' })
  async updateSubscription(
    @Param('userId') userId: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.adminService.updateSubscription(userId, dto.subscriptionLevel);
  }
}
