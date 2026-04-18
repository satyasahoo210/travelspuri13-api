import { PrismaService } from '@/common/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(roomTypeId: string, startDate: Date, endDate: Date, tenantId: string) {
    const days = this.getDatesInRange(startDate, endDate)

    // Ensure inventory records exist for the range
    await this.ensureInventoryRecords(roomTypeId, days, tenantId)

    return this.prisma.inventory.findMany({
      where: {
        roomTypeId,
        tenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  async decrementAvailability(
    tx: any,
    roomTypeId: string,
    date: Date,
    quantity: number,
  ) {
    const result = await tx.inventory.update({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date,
        },
      },
      data: {
        availableRooms: { decrement: quantity },
      },
    })

    if (result.availableRooms < 0) {
      throw new BadRequestException(
        `No availability for room type ${roomTypeId} on ${date.toISOString()}`,
      )
    }

    return result
  }

  async incrementAvailability(
    tx: any,
    roomTypeId: string,
    date: Date,
    quantity: number,
  ) {
    return tx.inventory.update({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date,
        },
      },
      data: {
        availableRooms: { increment: quantity },
      },
    })
  }

  private async ensureInventoryRecords(roomTypeId: string, dates: Date[], tenantId: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { _count: { select: { rooms: true } } },
    })

    if (!roomType) throw new BadRequestException('Room type not found')

    const roomCount = roomType._count.rooms

    for (const date of dates) {
      await this.prisma.inventory.upsert({
        where: {
          roomTypeId_date: {
            roomTypeId,
            date,
          },
        },
        update: {}, // Do nothing if exists
        create: {
          roomTypeId,
          tenantId,
          date,
          totalRooms: roomCount,
          availableRooms: roomCount,
        },
      })
    }
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }
}
