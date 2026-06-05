import { BookingSource, BookingStatus } from '@/generated/prisma/client';
import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Guest } from '../../guest/dto/guest.type';

registerEnumType(BookingSource, { name: 'BookingSource' });
registerEnumType(BookingStatus, { name: 'BookingStatus' });

@ObjectType()
export class BookingRoom {
  @Field(() => ID)
  id!: string;

  @Field()
  bookingId!: string;

  @Field()
  roomTypeId!: string;

  @Field(() => Int, { defaultValue: 1 })
  quantity!: number;

  @Field(() => String, { nullable: true })
  roomId?: string | null;

  @Field(() => Float, { nullable: true })
  priceOverride?: number | null;

  @Field(() => BookingStatus, { defaultValue: BookingStatus.CONFIRMED })
  status!: BookingStatus;

  @Field(() => Date, { nullable: true })
  checkInDate?: Date | null;

  @Field(() => Date, { nullable: true })
  checkOutDate?: Date | null;
}

@ObjectType()
export class Booking {
  @Field(() => ID)
  id!: string;

  @Field()
  guestId!: string;

  @Field()
  propertyId!: string;

  @Field()
  tenantId!: string;

  @Field(() => BookingSource, { defaultValue: BookingSource.DIRECT })
  source!: BookingSource;

  @Field(() => BookingStatus, { defaultValue: BookingStatus.CONFIRMED })
  status!: BookingStatus;

  @Field(() => Date)
  checkInDate!: Date;

  @Field(() => Date)
  checkOutDate!: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  adults?: number | null;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  children?: number | null;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  discountAmount?: number | null;

  @Field(() => String, { nullable: true, defaultValue: 'FIXED' })
  discountType?: string | null;

  @Field(() => Float, { nullable: true })
  totalAmount?: number | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  waiveLastDayCharge?: boolean | null;

  @Field(() => Date, { nullable: true })
  actualCheckOut?: Date | null;

  @Field(() => [BookingRoom], { nullable: 'itemsAndList', defaultValue: [] })
  BookingRoom?: BookingRoom[];

  @Field(() => Guest, { nullable: true })
  Guest?: any;
}

@ObjectType()
export class SyncBookingsResponse {
  @Field(() => [Booking])
  data!: Booking[];

  @Field(() => Float)
  timestamp!: number;
}
