import { Module } from '@nestjs/common'
import { PricingService } from './pricing.service'
import { PricingController } from './pricing.controller'
import { PricingResolver } from './pricing.resolver'

@Module({
  controllers: [PricingController],
  providers: [PricingService, PricingResolver],
  exports: [PricingService],
})
export class PricingModule {}
