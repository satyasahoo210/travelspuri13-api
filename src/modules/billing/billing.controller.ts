import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentStatus } from '@prisma/client';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get billing info for a booking' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.billingService.findByBooking(bookingId);
  }

  @Patch('booking/:bookingId/status')
  @ApiOperation({ summary: 'Update payment status' })
  updateStatus(
    @Param('bookingId') bookingId: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.billingService.updatePaymentStatus(bookingId, status);
  }
}
