import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async findByBooking(bookingId: string) {
    return this.prisma.billing.findUnique({
      where: { bookingId },
    });
  }

  async updatePaymentStatus(bookingId: string, status: any) {
    return this.prisma.billing.update({
      where: { bookingId },
      data: { paymentStatus: status },
    });
  }
}
