import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateGuestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone!: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  @IsOptional()
  idProofType?: string

  @ApiProperty({ example: 'A1234567' })
  @IsString()
  @IsOptional()
  idProofNumber?: string

  @ApiProperty({ example: 'tenant_123' })
  @IsUUID()
  tenantId!: string
}
