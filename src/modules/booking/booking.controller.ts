import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BookingService } from './booking.service'
import { CreateBookingDto } from './dto/booking.dto'

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto)
  }

  @Post('cancel/:id')
  @ApiOperation({ summary: 'Cancel an existing booking' })
  async cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id)
  }
}
