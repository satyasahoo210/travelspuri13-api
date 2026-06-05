import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
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
  rooms!: BookingRoomInput[];
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
}
