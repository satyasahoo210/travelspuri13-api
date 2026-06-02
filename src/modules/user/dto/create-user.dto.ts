import { UserRole } from '@/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: [UserRole.PROPERTY_MANAGER, UserRole.STAFF], default: UserRole.STAFF })
  @IsIn([UserRole.PROPERTY_MANAGER, UserRole.STAFF])
  role!: UserRole;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tenantId?: string; // Required for SUPER_ADMIN, optional for TENANT_ADMIN (defaults to their own)
}
