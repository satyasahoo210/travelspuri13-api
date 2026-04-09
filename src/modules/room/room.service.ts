import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoomTypeDto, CreateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoomType(dto: CreateRoomTypeDto) {
    return this.prisma.roomType.create({
      data: dto,
    });
  }

  async createRoom(dto: CreateRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: dto,
      });

      // Update inventory totalRooms for all existing dates for this room type
      await tx.inventory.updateMany({
        where: { roomTypeId: dto.roomTypeId },
        data: {
          totalRooms: { increment: 1 },
          availableRooms: { increment: 1 },
        },
      });

      return room;
    });
  }

  async findRoomTypes(propertyId: string) {
    return this.prisma.roomType.findMany({
      where: { propertyId },
      include: { rooms: true },
    });
  }
}
