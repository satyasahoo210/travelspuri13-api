import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateRoomDto, CreateRoomTypeDto } from './dto/room.dto'

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoomType(dto: CreateRoomTypeDto) {
    return this.prisma.roomType.create({
      data: dto,
    })
  }

  async createRoom(dto: CreateRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: dto,
      })

      // Update inventory totalRooms for all existing dates for this room type
      await tx.inventory.updateMany({
        where: { roomTypeId: dto.roomTypeId },
        data: {
          totalRooms: { increment: 1 },
          availableRooms: { increment: 1 },
        },
      })

      return room
    })
  }

  async findRoomTypes(propertyId: string) {
    return this.prisma.roomType.findMany({
      where: { propertyId },
      include: { Room: true },
    })
  }

  async syncRooms(since: number, propertyId: string, tenantId: string) {
    const sinceDate = new Date(since)
    const rooms = await this.prisma.room.findMany({
      where: {
        RoomType: {
          propertyId,
          Property: {
            tenantId,
          },
        },
        updatedAt: {
          gt: sinceDate,
        },
      },
      include: {
        RoomType: true
      }
    })

    return {
      data: rooms,
      timestamp: Date.now(),
    }
  }
  async syncRoomTypes(since: number, propertyId: string, tenantId: string) {
    const sinceDate = new Date(since)
    const roomTypes = await this.prisma.roomType.findMany({
      where: {
        propertyId,
        Property: {
          tenantId,
        },
        updatedAt: {
          gt: sinceDate,
        },
      },
      include: {
        Room: true
      }
    })

    return {
      data: roomTypes,
      timestamp: Date.now(),
    }
  }

  async updateRoom(id: string, data: any) {
    return this.prisma.room.update({
      where: { id },
      data,
    })
  }

  async updateRoomStatus(id: string, status: any) {
    return this.prisma.room.update({
      where: { id },
      data: { housekeepingStatus: status },
    })
  }

  async updateRoomType(id: string, data: any) {
    return this.prisma.roomType.update({
      where: { id },
      data,
    })
  }
}
