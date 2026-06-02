import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'tenant@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: { FNB_MODULE: true } })
  @IsOptional()
  featureFlags?: Record<string, any>

  @ApiProperty({ example: 'tenant-admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string

  @ApiProperty({ example: '*********' })
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
  adminPassword!: string

  @ApiProperty({ example: 'Tenant Admin' })
  @IsString()
  @IsOptional()
  adminName?: string
}
