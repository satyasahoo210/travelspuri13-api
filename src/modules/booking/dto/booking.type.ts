import { BookingSource, BookingStatus } from '@/generated/prisma/client';
import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Billing, Payment } from '../../billing/dto/billing.type';
import { Guest } from '../../guest/dto/guest.type';
import { Property } from '../../property/dto/property.type';
import { Room, RoomType } from '../../room/dto/room.type';

registerEnumType(BookingSource, { name: 'BookingSource' });
registerEnumType(BookingStatus, { name: 'BookingStatus' });

@ObjectType()
export class Service {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  price!: number;

  @Field()
  propertyId!: string;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field()
  tenantId!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class BookingService {
  @Field(() => ID)
  id!: string;

  @Field()
  bookingId!: string;

  @Field()
  serviceId!: string;

  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field(() => Float)
  totalPrice!: number;

  @Field(() => Service, { nullable: true })
  Service?: Service;
}

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

  @Field(() => Room, { nullable: true })
  Room?: Room;

  @Field(() => RoomType, { nullable: true })
  RoomType?: RoomType;

  @Field(() => Booking, { nullable: true })
  Booking?: any;
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

  @Field(() => BookingSource, { nullable: true, defaultValue: BookingSource.DIRECT })
  source?: BookingSource | null;

  @Field(() => BookingStatus, { nullable: true, defaultValue: BookingStatus.CONFIRMED })
  status?: BookingStatus | null;

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

  @Field(() => [BookingService], { nullable: 'itemsAndList', defaultValue: [] })
  BookingService?: BookingService[];

  @Field(() => Guest, { nullable: true })
  Guest?: any;

  @Field(() => Property, { nullable: true })
  Property?: any;

  @Field(() => [Payment], { nullable: 'itemsAndList', defaultValue: [] })
  Payment?: any[];

  @Field(() => Billing, { nullable: true })
  Billing?: any;
}

@ObjectType()
export class SyncBookingsResponse {
  @Field(() => [Booking])
  data!: Booking[];

  @Field(() => Float)
  timestamp!: number;
}
