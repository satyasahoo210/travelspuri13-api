import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateGuestInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @Field()
  @IsUUID()
  tenantId!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  gstin?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  grNumber?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  preferences?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}

@InputType()
export class UpdateGuestInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  idProofUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  gstin?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  grNumber?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  preferences?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
