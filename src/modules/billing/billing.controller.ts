import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BillingService } from './billing.service'
import { TenantId } from '@/common/decorators/tenant-id.decorator'

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get billing info for a booking' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.billingService.findByBooking(bookingId)
  }

  @Patch('booking/:bookingId/status')
  @ApiOperation({ summary: 'Update payment status' })
  updateStatus(
    @Param('bookingId') bookingId: string,
    @Body('status') status: any,
  ) {
    return this.billingService.updatePaymentStatus(bookingId, status)
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync billings/payments updated since timestamp' })
  sync(@Query('since') since: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.billingService.syncBillings(lastSync, tenantId)
  }

  @Post('payment')
  @ApiOperation({ summary: 'Record a new payment' })
  createPayment(@Body() paymentData: any) {
    return this.billingService.createPayment(paymentData)
  }

  @Patch('payment/:id')
  @ApiOperation({ summary: 'Update an existing payment record' })
  updatePayment(@Param('id') id: string, @Body() paymentData: any) {
    return this.billingService.updatePayment(id, paymentData)
  }
}
