import { RedisModule } from '@/common/redis/redis.module'
import { Module } from '@nestjs/common'
import { InventoryModule } from '../inventory/inventory.module'
import { PricingModule } from '../pricing/pricing.module'
import { BookingController } from './booking.controller'
import { BookingService } from './booking.service'
import { BookingResolver } from './booking.resolver'

@Module({
  imports: [InventoryModule, PricingModule, RedisModule],
  controllers: [BookingController],
  providers: [BookingService, BookingResolver],
})
export class BookingModule {}
