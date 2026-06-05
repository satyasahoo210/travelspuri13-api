import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreatePropertyDto {
  @ApiProperty({ example: 'Grand Plaza Hotel' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: '123 Main St, New York, NY' })
  @IsString()
  @IsNotEmpty()
  address!: string

  @ApiProperty({ example: 'Asia/Kolkata' })
  @IsString()
  @IsNotEmpty()
  timezone!: string

  @ApiProperty({
    example: 12.0,
    description: 'Tax percentage for this property',
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxPercentage?: number

  @ApiProperty({ example: 'tenant_123' })
  @IsUUID()
  tenantId!: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ required: false, description: 'Check-in time' })
  @IsString()
  @IsOptional()
  checkInTime?: string

  @ApiProperty({ required: false, description: 'Check-out time' })
  @IsString()
  @IsOptional()
  checkOutTime?: string

  @ApiProperty({ required: false, example: {} })
  @IsOptional()
  settings?: any

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[]
}
