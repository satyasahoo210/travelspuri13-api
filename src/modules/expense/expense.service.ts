import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseInput, UpdateExpenseInput } from './dto/expense-input.type';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, input: CreateExpenseInput) {
    const { date, ...rest } = input;
    return this.prisma.expense.create({
      data: {
        ...rest,
        tenantId,
        date: date ? new Date(date) : new Date(),
      },
    });
  }

  async findAll(propertyId: string, tenantId: string) {
    return this.prisma.expense.findMany({
      where: { propertyId, tenantId },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string, tenantId: string, input: UpdateExpenseInput) {
    // Verify ownership
    const existing = await this.prisma.expense.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException(`Expense record not found`);
    }

    const { date, ...rest } = input;
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const existing = await this.prisma.expense.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException(`Expense record not found`);
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
