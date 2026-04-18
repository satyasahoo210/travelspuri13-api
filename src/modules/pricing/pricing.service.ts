import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { SetPriceDto } from './dto/pricing.dto'

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async setPrice(dto: SetPriceDto, tenantId: string) {
    const { roomTypeId, date, basePrice, seasonalModifier = 1 } = dto
    return this.prisma.pricing.upsert({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date: new Date(date),
        },
      },
      update: {
        basePrice,
        seasonalModifier,
      },
      create: {
        tenantId,
        roomTypeId,
        date: new Date(date),
        basePrice,
        seasonalModifier,
      },
    })
  }

  /**
   * Calculates the total base price (excluding tax) for a stay.
   * Logic: For each night, use specific pricing if exists, else fallback to RoomType defaultPrice.
   */
  async calculateStayPrice(
    roomTypeId: string,
    startDate: Date,
    endDate: Date,
    quantity: number,
  ): Promise<number> {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { defaultPrice: true },
    })

    if (!roomType) {
      throw new NotFoundException(`Room type ${roomTypeId} not found`)
    }

    const dates = this.getDatesInRange(startDate, endDate)
    let total = 0

    // Fetch all specific pricing for these dates at once
    const specificPrices = await this.prisma.pricing.findMany({
      where: {
        roomTypeId,
        date: {
          in: dates,
        },
      },
    })

    const priceMap = new Map(
      specificPrices.map((p) => [p.date.toISOString().split('T')[0], p]),
    )

    for (const date of dates) {
      const dateKey = date.toISOString().split('T')[0]
      const specificPricing = priceMap.get(dateKey)

      if (specificPricing) {
        const seasonalModifier = specificPricing.seasonalModifier ?? 1
        total += Number(specificPricing.basePrice) * seasonalModifier
      } else {
        total += Number(roomType.defaultPrice)
      }
    }

    return total * quantity
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = []
    let currentDate = new Date(startDate)
    // Pricing is calculated per night, so we don't include the check-out date
    while (currentDate < endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }
}
