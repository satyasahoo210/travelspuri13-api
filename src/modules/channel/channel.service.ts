import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ChannelService {
  constructor(@InjectQueue('channel-sync') private syncQueue: Queue) {}

  async triggerInventorySync(roomTypeId: string) {
    await this.syncQueue.add('inventory-update', { roomTypeId });
  }

  async triggerBookingSync(propertyId: string) {
    await this.syncQueue.add('booking-sync', { propertyId });
  }
}
