import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@/generated/prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => UserRole, { defaultValue: UserRole.STAFF })
  @IsIn([UserRole.PROPERTY_MANAGER, UserRole.STAFF])
  role!: UserRole;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
