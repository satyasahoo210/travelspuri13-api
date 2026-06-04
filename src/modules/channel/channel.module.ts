import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ChannelProcessor } from './channel.processor';
import { ChannelService } from './channel.service';

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
