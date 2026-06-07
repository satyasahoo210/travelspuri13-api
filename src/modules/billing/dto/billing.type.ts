import { Field, ID, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '@/generated/prisma/client';
import { Booking } from '../../booking/dto/booking.type';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class Billing {
  @Field(() => ID)
  id!: string;

  @Field()
  bookingId!: string;

  @Field()
  tenantId!: string;

  @Field(() => Float)
  totalAmount!: number;

  @Field(() => Float)
  taxAmount!: number;

  @Field(() => PaymentStatus, { nullable: true })
  paymentStatus?: PaymentStatus | null;

  @Field(() => String, { nullable: true })
  currency?: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}

@ObjectType()
export class Payment {
  @Field(() => ID)
  id!: string;

  @Field()
  bookingId!: string;

  @Field()
  tenantId!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  method!: string;

  @Field(() => PaymentStatus, { nullable: true })
  status?: PaymentStatus | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => Booking, { nullable: true })
  Booking?: Booking;
}

@ObjectType()
export class SyncPaymentsResponse {
  @Field(() => [Payment])
  data!: Payment[];

  @Field(() => Float)
  timestamp!: number;
}
