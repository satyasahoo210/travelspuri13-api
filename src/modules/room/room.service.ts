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

  async findRooms(propertyId: string) {
    return this.prisma.room.findMany({
      where: {
        RoomType: {
          propertyId,
        },
      },
      include: {
        RoomType: true,
      },
    })
  }

  async updateRoom(id: string, data: any, user?: any) {
    const room = await this.prisma.room.update({
      where: { id },
      data,
      include: { RoomType: true },
    })

    if (user) {
      let type = 'maintenance';
      let title = `Updated Room ${room.roomNumber}`;
      if (data.housekeepingStatus) {
        type = data.housekeepingStatus === 'READY' || data.housekeepingStatus === 'CLEANING' ? 'clean' : 'dirty';
        title = `Room ${room.roomNumber} marked as ${data.housekeepingStatus}`;
      } else if (data.status) {
        title = `Room ${room.roomNumber} status set to ${data.status}`;
      }

      await this.prisma.recentActivity.create({
        data: {
          propertyId: room.RoomType.propertyId,
          tenantId: user.tenantId,
          title,
          type,
          staffName: user.name || user.email || 'Staff',
        }
      }).catch(err => console.error('Failed to log activity:', err));
    }

    return room
  }

  async updateRoomStatus(id: string, status: any, user?: any) {
    const room = await this.prisma.room.update({
      where: { id },
      data: { housekeepingStatus: status },
      include: { RoomType: true },
    })

    if (user) {
      const type = status === 'READY' || status === 'CLEANING' ? 'clean' : 'dirty';
      const title = `Room ${room.roomNumber} marked as ${status}`;
      await this.prisma.recentActivity.create({
        data: {
          propertyId: room.RoomType.propertyId,
          tenantId: user.tenantId,
          title,
          type,
          staffName: user.name || user.email || 'Staff',
        }
      }).catch(err => console.error('Failed to log activity:', err));
    }

    return room
  }

  async updateRoomType(id: string, data: any) {
    return this.prisma.roomType.update({
      where: { id },
      data,
    })
  }
}
