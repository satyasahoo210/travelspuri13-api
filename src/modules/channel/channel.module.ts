import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ChannelService } from './channel.service';
import { ChannelProcessor } from './channel.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'channel-sync',
    }),
  ],
  providers: [ChannelService, ChannelProcessor],
  exports: [ChannelService],
})
export class ChannelModule {}
