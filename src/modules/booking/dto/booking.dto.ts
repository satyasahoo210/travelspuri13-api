import { BookingSource } from '@/generated/prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator'

class BookingRoomDto {
  @ApiProperty({ example: 'rt_123' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number

  @ApiProperty({ example: 'room_123', required: false })
  @IsString()
  @IsOptional()
  roomId?: string

  @ApiProperty({ example: 1500, required: false })
  @IsNumber()
  @IsOptional()
  priceOverride?: number
}

export class CreateBookingDto {
  @ApiProperty({ example: 'guest_123' })
  @IsString()
  @IsNotEmpty()
  guestId!: string

  @ApiProperty({ example: 'prop_123' })
  @IsString()
  @IsNotEmpty()
  propertyId!: string

  @ApiProperty({ enum: BookingSource, default: BookingSource.DIRECT })
  @IsEnum(BookingSource)
  source!: BookingSource

  @ApiProperty({ example: '2023-12-01' })
  @IsDateString()
  checkInDate!: string

  @ApiProperty({ example: '2023-12-05' })
  @IsDateString()
  checkOutDate!: string

  @ApiProperty({ type: [BookingRoomDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingRoomDto)
  rooms!: BookingRoomDto[]

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @IsOptional()
  adults?: number

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  children?: number

  @ApiProperty({ example: 'No smoking room', required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  waiveLastDayCharge?: boolean

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  advanceAmount?: number

  @ApiProperty({ example: 'CASH', required: false })
  @IsString()
  @IsOptional()
  advanceMethod?: string
}

export class CancelBookingDto {
  @ApiProperty({ example: 'book_123' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string
}

