import { IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetPriceDto {
  @ApiProperty({ example: 'room_type_uuid' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string

  @ApiProperty({ example: '2023-12-25' })
  @IsDateString()
  date!: string

  @ApiProperty({ example: 1500.0, description: 'Base price for this date' })
  @IsNumber()
  @Min(0)
  basePrice!: number

  @ApiProperty({ example: 1.2, description: 'Surcharge multiplier (e.g. 1.2 for +20%)', default: 1.0 })
  @IsNumber()
  @Min(0)
  seasonalModifier!: number
}
