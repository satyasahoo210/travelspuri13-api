import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
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
  async create(@Body() createBookingDto: CreateBookingDto, @TenantId() tenantId: string) {
    return this.bookingService.createBooking(createBookingDto, tenantId)
  }

  @Post('cancel/:id')
  @ApiOperation({ summary: 'Cancel an existing booking' })
  async cancel(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.bookingService.cancelBooking(id, tenantId)
  }
 
  @Get('sync')
  @ApiOperation({ summary: 'Sync bookings since a certain timestamp' })
  async sync(@Query('since') since: string, @Query('propertyId') propertyId: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.bookingService.syncBookings(lastSync, propertyId, tenantId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing booking' })
  async update(@Param('id') id: string, @Body() updateBookingDto: any, @TenantId() tenantId: string) {
    return this.bookingService.updateBooking(id, updateBookingDto, tenantId)
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate and download invoice for a booking' })
  async downloadInvoice(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.bookingService.getInvoicePDF(id, tenantId)
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice_${id.slice(0, 8)}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    })
    
    res.end(pdfBuffer)
  }
}
