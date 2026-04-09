import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Deluxe Suite' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  capacity!: number

  @ApiProperty({ example: 'prop_123' })
  @IsString()
  @IsNotEmpty()
  propertyId!: string
}

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  roomNumber!: string

  @ApiProperty({ example: 'rt_123' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string
}
