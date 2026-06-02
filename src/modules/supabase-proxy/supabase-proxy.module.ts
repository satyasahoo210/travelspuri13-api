import { Module } from '@nestjs/common';
import { SupabaseProxyController } from './supabase-proxy.controller';

@Module({
  controllers: [SupabaseProxyController],
})
export class SupabaseProxyModule {}
