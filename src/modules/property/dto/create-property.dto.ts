import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator'

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

  @ApiProperty({ example: 'owner_123' })
  @IsUUID()
  ownerId!: string

  @ApiProperty({
    example: 12.0,
    description: 'Tax percentage for this property',
  })
  @IsNumber()
  @Min(0)
  taxPercentage!: number

  @ApiProperty({ example: 'tenant_123' })
  @IsUUID()
  tenantId!: string
}
