import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { ExpenseService } from './expense.service';
import { Expense } from './dto/expense.type';
import { CreateExpenseInput, UpdateExpenseInput } from './dto/expense-input.type';

@Resolver(() => Expense)
@UseGuards(JwtAuthGuard)
export class ExpenseResolver {
  constructor(private readonly expenseService: ExpenseService) {}

  @Query(() => [Expense])
  async expenses(
    @Args('propertyId') propertyId: string,
    @TenantId() tenantId: string,
  ): Promise<Expense[]> {
    const expenses = await this.expenseService.findAll(propertyId, tenantId);
    return expenses as any;
  }

  @Mutation(() => Expense)
  async createExpense(
    @Args('input') input: CreateExpenseInput,
    @TenantId() tenantId: string,
  ): Promise<Expense> {
    const expense = await this.expenseService.create(tenantId, input);
    return expense as any;
  }

  @Mutation(() => Expense)
  async updateExpense(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateExpenseInput,
    @TenantId() tenantId: string,
  ): Promise<Expense> {
    const expense = await this.expenseService.update(id, tenantId, input);
    return expense as any;
  }

  @Mutation(() => Expense)
  async deleteExpense(
    @Args('id', { type: () => ID }) id: string,
    @TenantId() tenantId: string,
  ): Promise<Expense> {
    const expense = await this.expenseService.delete(id, tenantId);
    return expense as any;
  }
}
