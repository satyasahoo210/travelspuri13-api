import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillingResolver } from './billing.resolver';

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingResolver],
  exports: [BillingService],
})
export class BillingModule {}
