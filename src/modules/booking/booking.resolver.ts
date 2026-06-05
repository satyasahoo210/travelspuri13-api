import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { CreateBookingInput, UpdateBookingInput } from './dto/booking-input.type';
import { Booking, SyncBookingsResponse } from './dto/booking.type';

@Resolver()
@UseGuards(JwtAuthGuard)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  @Mutation(() => Booking)
  async createBooking(
    @Args('input') input: CreateBookingInput,
    @TenantId() tenantId: string,
  ): Promise<Booking> {
    const booking = await this.bookingService.createBooking(input, tenantId);
    return booking as any;
  }

  @Mutation(() => Booking)
  async cancelBooking(
    @Args('id', { type: () => ID }) id: string,
    @TenantId() tenantId: string,
  ): Promise<Booking> {
    const booking = await this.bookingService.cancelBooking(id, tenantId);
    return booking as any;
  }

  @Query(() => SyncBookingsResponse)
  async syncBookings(
    @TenantId() tenantId: string,
    @Args('propertyId', { type: () => String }) propertyId: string,
    @Args('since', { nullable: true }) since?: string
  ): Promise<SyncBookingsResponse> {
    const lastSync = since ? parseInt(since, 10) : 0;
    const result = await this.bookingService.syncBookings(lastSync, propertyId, tenantId);
    return result as any;
  }

  @Mutation(() => Booking)
  async updateBooking(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBookingInput,
    @TenantId() tenantId: string,
  ): Promise<Booking> {
    const booking = await this.bookingService.updateBooking(id, input, tenantId);
    return booking as any;
  }
}
