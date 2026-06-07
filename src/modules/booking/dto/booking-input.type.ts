import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingSource, BookingStatus } from '@/generated/prisma/client';

@InputType()
export class BookingRoomInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  roomId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  priceOverride?: number;
}

@InputType()
export class CreateBookingInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @Field(() => BookingSource, { defaultValue: BookingSource.DIRECT })
  @IsEnum(BookingSource)
  source!: BookingSource;

  @Field()
  @IsDateString()
  checkInDate!: string;

  @Field()
  @IsDateString()
  checkOutDate!: string;

  @Field(() => [BookingRoomInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingRoomInput)
  rooms!: BookingRoomInput[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  adults?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  children?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  waiveLastDayCharge?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  advanceAmount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advanceMethod?: string;
}

@InputType()
export class UpdateBookingInput {
  @Field(() => BookingStatus, { nullable: true })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  adults?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  children?: number;

  @Field(() => Float, { nullable: true })
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  discountType?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  waiveLastDayCharge?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  actualCheckOut?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  totalAmount?: number;
}

@InputType()
export class UpdateBookingRoomInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  roomId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  roomTypeId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  priceOverride?: number;

  @Field({ nullable: true })
  @IsOptional()
  checkInDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  checkOutDate?: string;
}

@InputType()
export class UpdateBookingServiceInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  totalPrice?: number;
}
