import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Locations')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'List all provinces' })
  async listProvinces() {
    return this.locationService.listProvinces();
  }

  @Post('provinces')
  @ApiOperation({ summary: 'Create a province' })
  async createProvince(@Body() dto: CreateProvinceDto) {
    return this.locationService.createProvince(dto.name);
  }

  @Get('provinces/:provinceId/districts')
  @ApiOperation({ summary: 'List districts of a province' })
  async listDistricts(@Param('provinceId') provinceId: string) {
    return this.locationService.listDistricts(provinceId);
  }

  @Post('districts')
  @ApiOperation({ summary: 'Create a district' })
  async createDistrict(@Body() dto: CreateDistrictDto) {
    return this.locationService.createDistrict(dto.provinceId, dto.name);
  }

  @Get('districts/:districtId/neighborhoods')
  @ApiOperation({ summary: 'List neighborhoods of a district' })
  async listNeighborhoods(@Param('districtId') districtId: string) {
    return this.locationService.listNeighborhoods(districtId);
  }

  @Post('neighborhoods')
  @ApiOperation({ summary: 'Create a neighborhood' })
  async createNeighborhood(@Body() dto: CreateNeighborhoodDto) {
    return this.locationService.createNeighborhood(dto.districtId, dto.name);
  }
}
