import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(private prisma: PrismaService) {}

  async createProvince(name: string) {
    const province = await this.prisma.province.create({ data: { name } });
    this.logger.log(`Province created: ${name}`);
    return province;
  }

  async listProvinces() {
    const items = await this.prisma.province.findMany({ orderBy: { name: 'asc' } });
    return { items };
  }

  async createDistrict(provinceId: string, name: string) {
    const province = await this.prisma.province.findUnique({ where: { id: provinceId } });
    if (!province) throw new NotFoundException('Province not found');
    const district = await this.prisma.district.create({ data: { provinceId, name } });
    this.logger.log(`District created: ${name} in province ${provinceId}`);
    return district;
  }

  async listDistricts(provinceId: string) {
    const province = await this.prisma.province.findUnique({ where: { id: provinceId } });
    if (!province) throw new NotFoundException('Province not found');
    const items = await this.prisma.district.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' },
    });
    return { items };
  }

  async createNeighborhood(districtId: string, name: string) {
    const district = await this.prisma.district.findUnique({ where: { id: districtId } });
    if (!district) throw new NotFoundException('District not found');
    const neighborhood = await this.prisma.neighborhood.create({ data: { districtId, name } });
    this.logger.log(`Neighborhood created: ${name} in district ${districtId}`);
    return neighborhood;
  }

  async listNeighborhoods(districtId: string) {
    const district = await this.prisma.district.findUnique({ where: { id: districtId } });
    if (!district) throw new NotFoundException('District not found');
    const items = await this.prisma.neighborhood.findMany({
      where: { districtId },
      orderBy: { name: 'asc' },
    });
    return { items };
  }
}
