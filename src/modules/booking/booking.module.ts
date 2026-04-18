import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [InventoryModule, PricingModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
