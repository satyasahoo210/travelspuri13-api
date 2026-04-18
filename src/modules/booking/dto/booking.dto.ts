import { BookingSource } from '@/generated/prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
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
}

export class CancelBookingDto {
  @ApiProperty({ example: 'book_123' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string
}
