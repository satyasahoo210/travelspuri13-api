import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateMessageInput } from './dto/message-input.type';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, input: CreateMessageInput) {
    return this.prisma.message.create({
      data: {
        ...input,
        tenantId,
      },
    });
  }

  async findAllByGuest(guestId: string, tenantId: string) {
    return this.prisma.message.findMany({
      where: { guestId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
