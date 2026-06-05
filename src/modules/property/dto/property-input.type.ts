import { InputType, Field, Float } from '@nestjs/graphql';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreatePropertyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxPercentage?: number;

  @Field()
  @IsUUID()
  tenantId!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  checkInTime?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  settings?: string;

  @Field(() => [String], { nullable: 'itemsAndList', defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
