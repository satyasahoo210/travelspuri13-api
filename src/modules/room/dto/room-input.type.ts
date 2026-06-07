import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { HousekeepingStatus, RoomStatus } from '@/generated/prisma/client';

@InputType()
export class CreateRoomTypeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  defaultPrice!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  propertyId!: string;
}

@InputType()
export class CreateRoomInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;
}

@InputType()
export class UpdateRoomTypeInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultPrice?: number;
}

@InputType()
export class UpdateRoomInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  roomTypeId?: string;

  @Field(() => RoomStatus, { nullable: true })
  @IsOptional()
  status?: RoomStatus;

  @Field(() => HousekeepingStatus, { nullable: true })
  @IsOptional()
  housekeepingStatus?: HousekeepingStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  priorityCleaning?: boolean;
}

