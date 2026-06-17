import { PrismaService } from '@/common/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(
    tx: any,
    propertyId: string,
    tenantId: string,
    title: string,
    type: string,
    staffName: string,
  ) {
    const client = tx || this.prisma
    return client.recentActivity.create({
      data: {
        propertyId,
        tenantId,
        title,
        type,
        staffName,
      },
    })
  }

  async findRecentActivities(propertyId: string, limit = 10) {
    return this.prisma.recentActivity.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}
