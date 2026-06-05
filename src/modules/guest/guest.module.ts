import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { GuestResolver } from './guest.resolver';

@Module({
  controllers: [GuestController],
  providers: [GuestService, GuestResolver],
  exports: [GuestService],
})
export class GuestModule {}
