import { PrismaService } from '@/common/prisma/prisma.service'
import { RedisService } from '@/common/redis/redis.service'
import { BookingStatus } from '@/generated/prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InventoryService } from '../inventory/inventory.service'
import { PricingService } from '../pricing/pricing.service'
import { CreateBookingDto } from './dto/booking.dto'

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private redisService: RedisService,
    private pricingService: PricingService,
  ) {}

  async createBooking(dto: CreateBookingDto, tenantId: string) {
    const { checkInDate, checkOutDate, rooms, guestId, propertyId, source } =
      dto
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, tenantId },
      select: { taxPercentage: true },
    })

    if (!property) {
      throw new NotFoundException(
        `Property ${propertyId} not found for this tenant`,
      )
    }

    // We only decrease inventory for dates up to checkOutDate - 1 day
    const bookingDates = this.getDatesInRange(start, this.addDays(end, -1))

    return this.prisma.$transaction(async (tx) => {
      // 1. Inventory Management
      for (const roomItem of rooms) {
        for (const date of bookingDates) {
          const lockKey = `lock:inventory:${roomItem.roomTypeId}:${date.toISOString().split('T')[0]}`
          const lockId = await this.redisService.acquireLock(lockKey, 30000) // 30s TTL

          if (!lockId) {
            throw new BadRequestException(
              'Room type is currently being booked by another user. Please try again.',
            )
          }

          try {
            await this.inventoryService.decrementAvailability(
              tx,
              roomItem.roomTypeId,
              date,
              roomItem.quantity,
            )
          } finally {
            await this.redisService.releaseLock(lockKey, lockId)
          }
        }
      }

      // 2. Price Calculation
      let totalBaseAmount = 0
      for (const roomItem of rooms) {
        totalBaseAmount += await this.pricingService.calculateStayPrice(
          roomItem.roomTypeId,
          start,
          end,
          roomItem.quantity,
        )
      }

      const taxAmount = (totalBaseAmount * (property.taxPercentage ?? 0)) / 100
      const totalAmount = totalBaseAmount + taxAmount

      // 3. Create Booking
      const booking = await tx.booking.create({
        data: {
          tenantId,
          guestId,
          propertyId,
          source,
          status: BookingStatus.CONFIRMED,
          checkInDate: start,
          checkOutDate: end,
          BookingRoom: {
            create: rooms.map((r) => ({
              roomTypeId: r.roomTypeId,
              quantity: r.quantity,
            })),
          },
        },
        include: { BookingRoom: true },
      })

      // 4. Create Billing
      await tx.billing.create({
        data: {
          tenantId,
          bookingId: booking.id,
          totalAmount: totalAmount,
          taxAmount: taxAmount,
          paymentStatus: 'PENDING',
        },
      })

      return booking
    })
  }

  async cancelBooking(bookingId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, tenantId },
        include: { BookingRoom: true },
      })

      if (!booking || booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking not found or already cancelled')
      }

      const bookingDates = this.getDatesInRange(
        booking.checkInDate,
        this.addDays(booking.checkOutDate, -1),
      )

      // 1. Restore Inventory
      for (const roomItem of booking.BookingRoom) {
        for (const date of bookingDates) {
          await this.inventoryService.incrementAvailability(
            tx,
            roomItem.roomTypeId,
            date,
            roomItem.quantity,
          )
        }
      }

      // 2. Update Status
      return tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      })
    })
  }

  async syncBookings(since: number, propertyId: string, tenantId: string) {
    const sinceDate = new Date(since)

    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        propertyId,
        updatedAt: {
          gt: sinceDate,
        },
      },
      include: {
        BookingRoom: true,
      },
    })

    return {
      data: bookings,
      timestamp: Date.now(),
    }
  }

  async updateBooking(bookingId: string, dto: any, tenantId: string) {
    // Exclude relations from the raw database update data
    const { bookingRooms, billing, services, payments, orders, ...updateData } = dto;
    return this.prisma.booking.update({
      where: { id: bookingId, tenantId },
      data: updateData,
    });
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

  private addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
}
