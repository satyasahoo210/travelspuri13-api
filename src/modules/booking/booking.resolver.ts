import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Float, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { CreateBookingInput, UpdateBookingInput, UpdateBookingRoomInput, UpdateBookingServiceInput } from './dto/booking-input.type';
import { Booking, BookingRoom, BookingService as BookingServiceType, Service as ServiceType, SyncBookingsResponse } from './dto/booking.type';

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

  @Query(() => Booking, { nullable: true })
  async booking(
    @Args('id', { type: () => ID }) id: string,
    @TenantId() tenantId: string,
  ): Promise<Booking | null> {
    return this.bookingService.findOne(id, tenantId) as any;
  }

  @Query(() => [ServiceType])
  async services(
    @Args('propertyId', { type: () => String }) propertyId: string,
    @TenantId() tenantId: string,
  ): Promise<any[]> {
    return this.bookingService.getServices(propertyId, tenantId) as any;
  }

  @Query(() => [BookingRoom])
  async activeBookingRooms(
    @Args('propertyId', { type: () => String }) propertyId: string,
    @TenantId() tenantId: string,
  ): Promise<any[]> {
    return this.bookingService.getActiveBookingRooms(propertyId, tenantId) as any;
  }

  @Query(() => [Booking])
  async bookings(
    @TenantId() tenantId: string,
    @Args('propertyId', { type: () => String, nullable: true }) propertyId?: string,
    @Args('guestId', { type: () => String, nullable: true }) guestId?: string,
  ): Promise<Booking[]> {
    if(!propertyId && !guestId){
      throw new Error('Property ID or Guest ID is required');
    }

    if(propertyId){
      return this.bookingService.findBookingsByProperty(propertyId, tenantId) as any;
    } else {
      return this.bookingService.findBookingsByGuest(guestId!, tenantId) as any;
    }
  }

  @Query(() => [BookingRoom])
  async bookingRooms(
    @Args('propertyId', { type: () => String }) propertyId: string,
    @TenantId() tenantId: string,
  ): Promise<BookingRoom[]> {
    return this.bookingService.findBookingRoomsByProperty(propertyId, tenantId) as any;
  }

  @Mutation(() => BookingRoom)
  async addBookingRoom(
    @Args('bookingId', { type: () => ID }) bookingId: string,
    @Args('roomId', { type: () => ID, nullable: true }) roomId: string | null,
    @Args('roomTypeId', { type: () => ID }) roomTypeId: string,
    @Args('checkInDate', { type: () => String, nullable: true }) checkInDate: string | null,
    @Args('checkOutDate', { type: () => String, nullable: true }) checkOutDate: string | null,
  ): Promise<any> {
    return this.bookingService.addBookingRoom(bookingId, roomId, roomTypeId, checkInDate, checkOutDate) as any;
  }

  @Mutation(() => BookingRoom)
  async updateBookingRoom(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBookingRoomInput,
  ): Promise<any> {
    return this.bookingService.updateBookingRoom(id, input) as any;
  }

  @Mutation(() => Boolean)
  async deleteBookingRoom(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.bookingService.deleteBookingRoom(id);
  }

  @Mutation(() => BookingServiceType)
  async addBookingService(
    @Args('bookingId', { type: () => ID }) bookingId: string,
    @Args('serviceId', { type: () => ID }) serviceId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('totalPrice', { type: () => Float }) totalPrice: number,
  ): Promise<any> {
    return this.bookingService.addBookingService(bookingId, serviceId, quantity, totalPrice) as any;
  }

  @Mutation(() => BookingServiceType)
  async updateBookingService(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBookingServiceInput,
  ): Promise<any> {
    return this.bookingService.updateBookingService(id, input) as any;
  }

  @Mutation(() => Boolean)
  async deleteBookingService(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.bookingService.deleteBookingService(id);
  }
}
