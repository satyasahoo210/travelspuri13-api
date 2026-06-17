import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PaymentStatus } from '@/generated/prisma/client';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BillingService } from './billing.service';
import { CreatePaymentInput, UpdatePaymentInput } from './dto/billing-input.type';
import { Billing, Payment, SyncPaymentsResponse } from './dto/billing.type';

@Resolver()
@UseGuards(JwtAuthGuard)
export class BillingResolver {
  constructor(private readonly billingService: BillingService) {}

  @Query(() => Billing, { nullable: true })
  async billingInfo(
    @Args('bookingId', { type: () => ID }) bookingId: string,
  ): Promise<Billing | null> {
    const billing = await this.billingService.findByBooking(bookingId);
    return billing as any;
  }

  @Mutation(() => Billing)
  async updateBillingStatus(
    @Args('bookingId', { type: () => ID }) bookingId: string,
    @Args('status', { type: () => PaymentStatus }) status: PaymentStatus,
  ): Promise<Billing> {
    const billing = await this.billingService.updatePaymentStatus(bookingId, status);
    return billing as any;
  }

  @Query(() => SyncPaymentsResponse)
  async syncBillings(
    @TenantId() tenantId: string,
    @Args('propertyId', { type: () => String }) propertyId: string,
    @Args('since', { nullable: true }) since?: string,
  ): Promise<SyncPaymentsResponse> {
    const lastSync = since ? parseInt(since, 10) : 0;
    const result = await this.billingService.syncBillings(lastSync, propertyId, tenantId);
    return result as any;
  }

  @Query(() => [Payment])
  async payments(
    @TenantId() tenantId: string,
  ): Promise<Payment[]> {
    const payments = await this.billingService.findPaymentsByTenant(tenantId);
    return payments as any;
  }

  @Mutation(() => Payment)
  async createPayment(
    @Args('input') input: CreatePaymentInput,
    @CurrentUser() user: any,
  ): Promise<Payment> {
    const payment = await this.billingService.createPayment(input, user);
    return payment as any;
  }

  @Mutation(() => Payment)
  async updatePayment(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePaymentInput,
  ): Promise<Payment> {
    const payment = await this.billingService.updatePayment(id, input);
    return payment as any;
  }
}
