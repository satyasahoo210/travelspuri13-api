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
    const {
      checkInDate,
      checkOutDate,
      rooms,
      guestId,
      propertyId,
      source,
      adults,
      children,
      notes,
      waiveLastDayCharge,
      advanceAmount,
      advanceMethod,
    } = dto
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
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const nights = Math.max(1, diffDays)

    return this.prisma.$transaction(async (tx) => {
      // 1. Inventory Management
      for (const roomItem of rooms) {
        await this.inventoryService.ensureInventoryRecords(
          roomItem.roomTypeId,
          bookingDates,
          tenantId,
          tx,
        )

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
        if (roomItem.priceOverride !== undefined && roomItem.priceOverride !== null) {
          const calcNights = waiveLastDayCharge ? Math.max(1, nights - 1) : nights
          totalBaseAmount += Number(roomItem.priceOverride) * calcNights * roomItem.quantity
        } else {
          let basePrice = await this.pricingService.calculateStayPrice(
            roomItem.roomTypeId,
            start,
            end,
            roomItem.quantity,
          )
          if (waiveLastDayCharge && nights > 1) {
            const oneNightPrice = basePrice / nights
            basePrice = basePrice - oneNightPrice
          }
          totalBaseAmount += basePrice
        }
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
          adults: adults ?? 1,
          children: children ?? 0,
          notes: notes ?? null,
          waiveLastDayCharge: waiveLastDayCharge ?? false,
          totalAmount: totalAmount,
          BookingRoom: {
            create: rooms.map((r) => ({
              roomTypeId: r.roomTypeId,
              quantity: r.quantity,
              roomId: r.roomId ?? null,
              priceOverride: r.priceOverride ?? null,
              status: BookingStatus.CONFIRMED,
              checkInDate: start,
              checkOutDate: end,
            })),
          },
        },
        include: { BookingRoom: true },
      })

      // 4. Create Advance Payment (Optional)
      if (advanceAmount && advanceAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            tenantId,
            amount: advanceAmount,
            method: advanceMethod || 'CASH',
            status: totalAmount <= advanceAmount ? 'PAID' : 'PARTIAL',
            notes: 'Advance Booking Payment',
          },
        })
      }

      // 5. Create Billing
      const paymentStatus = (advanceAmount && advanceAmount >= totalAmount) ? 'PAID' : (advanceAmount && advanceAmount > 0) ? 'PARTIAL' : 'PENDING'
      await tx.billing.create({
        data: {
          tenantId,
          bookingId: booking.id,
          totalAmount: totalAmount,
          taxAmount: taxAmount,
          paymentStatus: paymentStatus as any,
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

      // 2. Update BookingRooms status to CANCELLED (only for active rooms)
      for (const roomItem of booking.BookingRoom) {
        if (roomItem.status === BookingStatus.CANCELLED || roomItem.status === BookingStatus.CHECKED_OUT) {
          continue;
        }

        const roomCheckOutTime = roomItem.checkOutDate ? roomItem.checkOutDate.getTime() : null;
        if (roomCheckOutTime === null || roomCheckOutTime === booking.checkOutDate.getTime()) {
          await tx.bookingRoom.update({
            where: { id: roomItem.id },
            data: { status: BookingStatus.CANCELLED },
          });
        }
      }

      // 3. Update Status
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
        BookingRoom: {
          include: {
            Room: {
              include: {
                RoomType: true,
              }
            },
            RoomType: true,
          },
        },
        Guest: true,
        Property: true,
        Payment: true,
        BookingService: {
          include: {
            Service: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'desc'
      }
    })

    return {
      data: bookings,
      timestamp: Date.now(),
    }
  }

  async findOne(bookingId: string, tenantId: string) {
    return this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      include: {
        BookingRoom: {
          include: {
            Room: {
              include: {
                RoomType: true,
              }
            },
            RoomType: true,
          },
        },
        Guest: true,
        Property: true,
        Payment: true,
        Billing: true,
        BookingService: {
          include: {
            Service: true,
          },
        },
      },
    });
  }

  async getServices(propertyId: string, tenantId: string) {
    return this.prisma.service.findMany({
      where: { propertyId, tenantId },
    });
  }

  async getActiveBookingRooms(propertyId: string, tenantId: string) {
    return this.prisma.bookingRoom.findMany({
      where: {
        Booking: {
          propertyId,
          tenantId,
          status: {
            notIn: ['CANCELLED', 'CHECKED_OUT'],
          },
        },
      },
      include: {
        Booking: true,
        Room: {
          include: {
            RoomType: true,
          }
        },
        RoomType: true,
      },
    });
  }

  async findBookingsByProperty(propertyId: string, tenantId: string) {
    return this.prisma.booking.findMany({
      where: { propertyId, tenantId },
      include: {
        BookingRoom: {
          include: {
            Room: true,
          },
        },
        Guest: true,
        Payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBookingsByGuest(guestId: string, tenantId: string) {
    return this.prisma.booking.findMany({
      where: { guestId, tenantId },
      include: {
        BookingRoom: {
          include: {
            Room: true,
          },
        },
        Guest: true,
        Payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBookingRoomsByProperty(propertyId: string, tenantId: string) {
    return this.prisma.bookingRoom.findMany({
      where: {
        Booking: {
          propertyId,
          tenantId,
        },
        roomId: {
          not: null,
        },
      },
      include: {
        Booking: {
          include: {
            Guest: true,
            Property: true,
          },
        },
        Room: true,
        RoomType: true,
      },
    });
  }

  async addBookingRoom(
    bookingId: string,
    roomId: string | null,
    roomTypeId: string,
    checkInDate: string | null,
    checkOutDate: string | null,
  ) {
    return this.prisma.bookingRoom.create({
      data: {
        bookingId,
        roomId: roomId || null,
        roomTypeId,
        quantity: 1,
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
      },
      include: {
        Room: {
          include: {
            RoomType: true,
          }
        },
        RoomType: true,
      },
    });
  }

  async updateBookingRoom(id: string, input: any) {
    const data: any = {};
    if (input.roomId !== undefined) data.roomId = input.roomId;
    if (input.roomTypeId !== undefined) data.roomTypeId = input.roomTypeId;
    if (input.priceOverride !== undefined) data.priceOverride = input.priceOverride;
    if (input.checkInDate !== undefined) data.checkInDate = input.checkInDate ? new Date(input.checkInDate) : null;
    if (input.checkOutDate !== undefined) data.checkOutDate = input.checkOutDate ? new Date(input.checkOutDate) : null;

    return this.prisma.bookingRoom.update({
      where: { id },
      data,
      include: {
        Room: {
          include: {
            RoomType: true,
          }
        },
        RoomType: true,
      },
    });
  }

  async deleteBookingRoom(id: string) {
    await this.prisma.bookingRoom.delete({
      where: { id },
    });
    return true;
  }

  async addBookingService(
    bookingId: string,
    serviceId: string,
    quantity: number,
    totalPrice: number,
  ) {
    return this.prisma.bookingService.create({
      data: {
        bookingId,
        serviceId,
        quantity,
        totalPrice,
      },
      include: {
        Service: true,
      },
    });
  }

  async updateBookingService(id: string, input: any) {
    return this.prisma.bookingService.update({
      where: { id },
      data: {
        quantity: input.quantity,
        totalPrice: input.totalPrice,
      },
      include: {
        Service: true,
      },
    });
  }

  async deleteBookingService(id: string) {
    await this.prisma.bookingService.delete({
      where: { id },
    });
    return true;
  }

  async updateBooking(bookingId: string, dto: any, tenantId: string) {
    // Exclude relations from the raw database update data
    const { bookingRooms, billing, services, payments, orders, ...updateData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current booking to get the old dates and statuses
      const currentBooking = await tx.booking.findFirst({
        where: { id: bookingId, tenantId },
        include: { BookingRoom: true },
      });

      if (!currentBooking) {
        throw new NotFoundException(`Booking ${bookingId} not found`);
      }

      // 2. Perform the main booking update
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: updateData,
      });

      // 3. Update active BookingRoom records based on old booking values
      const oldCheckIn = currentBooking.checkInDate;
      const oldCheckOut = currentBooking.checkOutDate;

      for (const room of currentBooking.BookingRoom) {
        // Skip rooms that are already cancelled or checked out
        if (room.status === BookingStatus.CANCELLED || room.status === BookingStatus.CHECKED_OUT) {
          continue;
        }

        const roomUpdates: any = {};

        // Update checkInDate if it was changed and matches the old checkInDate
        if (updateData.checkInDate !== undefined) {
          const roomCheckInTime = room.checkInDate ? room.checkInDate.getTime() : null;
          if (roomCheckInTime === null || roomCheckInTime === oldCheckIn.getTime()) {
            roomUpdates.checkInDate = updateData.checkInDate ? new Date(updateData.checkInDate) : null;
          }
        }

        // Update checkOutDate if it was changed and matches the old checkOutDate
        if (updateData.checkOutDate !== undefined) {
          const roomCheckOutTime = room.checkOutDate ? room.checkOutDate.getTime() : null;
          if (roomCheckOutTime === null || roomCheckOutTime === oldCheckOut.getTime()) {
            roomUpdates.checkOutDate = updateData.checkOutDate ? new Date(updateData.checkOutDate) : null;
          }
        }

        // Update status if it was changed
        if (updateData.status !== undefined) {
          // If status changes to CHECKED_OUT, only update the room if its checkout date is the active checkout date
          if (updateData.status === BookingStatus.CHECKED_OUT) {
            const roomCheckOutTime = room.checkOutDate ? room.checkOutDate.getTime() : null;
            if (roomCheckOutTime === null || roomCheckOutTime === oldCheckOut.getTime()) {
              roomUpdates.status = updateData.status;
            }
          } else {
            roomUpdates.status = updateData.status;
          }
        }

        if (Object.keys(roomUpdates).length > 0) {
          await tx.bookingRoom.update({
            where: { id: room.id },
            data: roomUpdates,
          });
        }
      }

      return updatedBooking;
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
