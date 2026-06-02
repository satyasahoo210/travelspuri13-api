import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreatePropertyDto } from './dto/create-property.dto'

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: createPropertyDto,
    })
  }

  async findAll(tenantId: string) {
    return this.prisma.property.findMany({
      where: { tenantId },
    })
  }

  async findOne(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: { RoomType: true },
    })
  }
}
