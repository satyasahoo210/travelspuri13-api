import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async findByBooking(bookingId: string) {
    return this.prisma.billing.findUnique({
      where: { bookingId },
    })
  }

  async updatePaymentStatus(bookingId: string, status: any) {
    return this.prisma.billing.update({
      where: { bookingId },
      data: { paymentStatus: status },
    })
  }

  async syncBillings(since: number, propertyId: string, tenantId: string) {
    const sinceDate = new Date(since)
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        Booking: {
          propertyId
        },
        updatedAt: {
          gt: sinceDate,
        },
      },
    })

    return {
      data: payments,
      timestamp: Date.now(),
    }
  }

  async createPayment(paymentData: any, user?: any) {
    const payment = await this.prisma.payment.create({
      data: paymentData,
    })

    if (user) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: paymentData.bookingId },
        include: { Guest: true },
      });
      if (booking) {
        const guestName = booking.Guest?.name || 'Guest';
        await this.prisma.recentActivity.create({
          data: {
            propertyId: booking.propertyId,
            tenantId: user.tenantId,
            title: `Payment of ₹${paymentData.amount.toLocaleString('en-IN')} received for booking of ${guestName}`,
            type: 'payment',
            staffName: user.name || user.email || 'Staff',
          }
        }).catch(err => console.error('Failed to log payment activity:', err));
      }
    }

    return payment;
  }

  async updatePayment(id: string, paymentData: any) {
    return this.prisma.payment.update({
      where: { id },
      data: paymentData,
    })
  }

  async findPaymentsByTenant(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: {
        Booking: {
          include: {
            Guest: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
