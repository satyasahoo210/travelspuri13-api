import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';

@InputType()
export class CreateTenantInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  featureFlags?: string; // JSON string

  @Field()
  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string;

  @Field()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password is too weak. It must contain at least 8 characters, including uppercase, lowercase, numbers, and symbols.',
    },
  )
  adminPassword!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  adminName?: string;
}
