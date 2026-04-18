import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    if (createTenantDto.email) {
      const existing = await this.prisma.tenant.findUnique({
        where: { email: createTenantDto.email },
      });
      if (existing) {
        throw new ConflictException('Tenant with this email already exists');
      }
    }

    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        email: createTenantDto.email,
        featureFlags: createTenantDto.featureFlags || {},
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }
}
