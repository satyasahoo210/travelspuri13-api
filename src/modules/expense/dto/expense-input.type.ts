import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateExpenseInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  category!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  date?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  propertyId!: string;
}

@InputType()
export class UpdateExpenseInput {
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  date?: string;
}
