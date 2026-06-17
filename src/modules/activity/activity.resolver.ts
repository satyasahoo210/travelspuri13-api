import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { UseGuards } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { ActivityService } from './activity.service'
import { RecentActivity } from './dto/activity.type'

@Resolver()
@UseGuards(JwtAuthGuard)
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Query(() => [RecentActivity])
  async recentActivities(
    @Args('propertyId', { type: () => String }) propertyId: string,
  ): Promise<any[]> {
    return this.activityService.findRecentActivities(propertyId)
  }
}
