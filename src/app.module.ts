import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { BookingModule } from './modules/booking/booking.module';
import { ChannelModule } from './modules/channel/channel.module';
import { FnBModule } from './modules/fnb/fnb.module';
import { GuestModule } from './modules/guest/guest.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NightAuditModule } from './modules/night-audit/night-audit.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PropertyModule } from './modules/property/property.module';
import { PublicModule } from './modules/public/public.module';
import { RoomModule } from './modules/room/room.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { SupabaseProxyModule } from './modules/supabase-proxy/supabase-proxy.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local', '.env.production'],
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    StorageModule,
    PublicModule,
    SupabaseModule,
    SupabaseProxyModule,
    AuthModule,
    PropertyModule,
    RoomModule,
    InventoryModule,
    BookingModule,
    GuestModule,
    BillingModule,
    ChannelModule,
    PricingModule,
    TenantModule,
    NightAuditModule,
    FnBModule,
    UserModule,
  ],
})
export class AppModule {}
