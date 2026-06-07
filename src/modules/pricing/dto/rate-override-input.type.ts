import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class CreateRateOverrideInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  rate!: number;
}
