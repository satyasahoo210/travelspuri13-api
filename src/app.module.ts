import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { PropertyModule } from './modules/property/property.module';
import { RoomModule } from './modules/room/room.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BookingModule } from './modules/booking/booking.module';
import { GuestModule } from './modules/guest/guest.module';
import { BillingModule } from './modules/billing/billing.module';
import { ChannelModule } from './modules/channel/channel.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    PropertyModule,
    RoomModule,
    InventoryModule,
    BookingModule,
    GuestModule,
    BillingModule,
    ChannelModule,
  ],
})
export class AppModule {}
