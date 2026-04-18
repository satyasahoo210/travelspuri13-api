import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class FnBService {
  constructor(private prisma: PrismaService) {}

  async createOrder(data: {
    tenantId: string;
    bookingId?: string;
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
    propertyId: string;
  }) {
    return this.prisma.order.create({
      data: {
        tenantId: data.tenantId,
        bookingId: data.bookingId,
        propertyId: data.propertyId,
        totalAmount: data.totalAmount,
        status: 'PENDING',
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            tenantId: data.tenantId,
          })),
        },
      },
    });
  }

  async getProducts(tenantId: string, category: string) {
    return this.prisma.product.findMany({
      where: { tenantId, category },
    });
  }
}
