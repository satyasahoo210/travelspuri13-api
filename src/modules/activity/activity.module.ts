import { Module } from '@nestjs/common'
import { ActivityResolver } from './activity.resolver'
import { ActivityService } from './activity.service'

@Module({
  providers: [ActivityService, ActivityResolver],
  exports: [ActivityService],
})
export class ActivityModule {}
