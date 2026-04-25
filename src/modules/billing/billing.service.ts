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

  async syncBillings(since: number, tenantId: string) {
    const sinceDate = new Date(since)
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
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
}
