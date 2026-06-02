import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('hotels')
  @ApiOperation({ summary: 'Get all active hotels for customer catalog' })
  getHotels() {
    return this.publicService.getHotels();
  }

  @Get('hotels/:slug')
  @ApiOperation({ summary: 'Get hotel by slug' })
  getHotelBySlug(@Param('slug') slug: string) {
    return this.publicService.getHotelBySlug(slug);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get rooms for a hotel' })
  getRooms(@Query('hotelId') hotelId: string) {
    return this.publicService.getRooms(hotelId);
  }
}
