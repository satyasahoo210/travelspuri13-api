import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentStatus } from '@/generated/prisma/client';

@InputType()
export class CreatePaymentInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  method!: string;

  @Field(() => PaymentStatus, { nullable: true })
  @IsOptional()
  status?: PaymentStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}

@InputType()
export class UpdatePaymentInput {
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  method?: string;

  @Field(() => PaymentStatus, { nullable: true })
  @IsOptional()
  status?: PaymentStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
