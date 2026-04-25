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
      include: { rooms: true },
    })
  }

  async syncRooms(since: number, tenantId: string) {
    const sinceDate = new Date(since)
    const rooms = await this.prisma.room.findMany({
      where: {
        roomType: {
          property: {
            tenantId
          }
        },
        updatedAt: {
          gt: sinceDate,
        },
      },
      include: {
        roomType: true
      }
    })

    return {
      data: rooms,
      timestamp: Date.now(),
    }
  }
  async syncRoomTypes(since: number, tenantId: string) {
    const sinceDate = new Date(since)
    const roomTypes = await this.prisma.roomType.findMany({
      where: {
        property: {
          tenantId
        },
        updatedAt: {
          gt: sinceDate,
        },
      },
      include: {
        rooms: true
      }
    })

    return {
      data: roomTypes,
      timestamp: Date.now(),
    }
  }
}
