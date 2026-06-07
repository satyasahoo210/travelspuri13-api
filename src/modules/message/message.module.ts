import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';

@Module({
  providers: [MessageService, MessageResolver],
  exports: [MessageService],
})
export class MessageModule {}
