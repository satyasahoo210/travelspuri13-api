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
    const client = tx || this.prisma
    const inventory = await client.inventory.findUnique({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date,
        },
      },
    })

    if (!inventory) {
      // If the inventory record doesn't exist, we don't need to increment it.
      return
    }

    const newAvailable = Math.min(inventory.totalRooms, inventory.availableRooms + quantity)

    return client.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        availableRooms: newAvailable,
      },
    })
  }

  async ensureInventoryRecords(roomTypeId: string, dates: Date[], tenantId: string, tx?: any) {
    const client = tx || this.prisma
    const roomType = await client.roomType.findUnique({
      where: { id: roomTypeId },
      include: { _count: { select: { Room: true } } },
    })

    if (!roomType) throw new BadRequestException('Room type not found')

    const roomCount = roomType._count.Room

    for (const date of dates) {
      await client.inventory.upsert({
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
    const endMidnight = new Date(endDate)
    endMidnight.setUTCHours(0, 0, 0, 0)

    let currentDate = new Date(startDate)
    while (true) {
      const currentMidnight = new Date(currentDate)
      currentMidnight.setUTCHours(0, 0, 0, 0)

      if (currentMidnight > endMidnight) {
        break
      }

      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }
}
