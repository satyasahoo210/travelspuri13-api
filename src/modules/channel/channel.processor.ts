import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('channel-sync')
export class ChannelProcessor extends WorkerHost {
  private readonly logger = new Logger(ChannelProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'inventory-update':
        this.logger.log('Syncing inventory with OTAs...');
        // Simulating sync logic
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      case 'booking-sync':
        this.logger.log('Syncing bookings from OTAs...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }

    return { success: true };
  }
}
