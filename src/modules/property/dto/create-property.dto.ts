import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Grand Plaza Hotel' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '123 Main St, New York, NY' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({ example: 'owner_123' })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @ApiProperty({ example: 12.0, description: 'Tax percentage for this property' })
  @IsNumber()
  @Min(0)
  taxPercentage!: number;
}
