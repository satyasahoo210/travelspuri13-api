import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateGuestDto } from './dto/create-guest.dto'

@Injectable()
export class GuestService {
  constructor(private prisma: PrismaService) {}

  async create(createGuestDto: CreateGuestDto) {
    const conditions: any[] = []
    if (createGuestDto.phone) {
      conditions.push({ phone: createGuestDto.phone })
    }
    if (createGuestDto.idProofNumber) {
      conditions.push({ idProofNumber: createGuestDto.idProofNumber })
    }

    if (conditions.length > 0) {
      const existing = await this.prisma.guest.findFirst({
        where: {
          tenantId: createGuestDto.tenantId,
          OR: conditions,
        },
      })
      if (existing) {
        return existing
      }
    }

    return this.prisma.guest.create({
      data: createGuestDto,
    })
  }

  async findAll(tenantId?: string) {
    if(tenantId){
      return this.prisma.guest.findMany({ where: { tenantId } })
    }
    return this.prisma.guest.findMany()
  }

  async findOne(id: string) {
    return this.prisma.guest.findUnique({
      where: { id },
    })
  }

  async update(id: string, updateGuestDto: any) {
    return this.prisma.guest.update({
      where: { id },
      data: updateGuestDto,
    })
  }

  async syncGuests(since: number, tenantId: string) {
    const sinceDate = new Date(since)
    const guests = await this.prisma.guest.findMany({
      where: {
        tenantId,
        updatedAt: {
          gt: sinceDate,
        },
      },
    })

    return {
      data: guests,
      timestamp: Date.now(),
    }
  }
}
