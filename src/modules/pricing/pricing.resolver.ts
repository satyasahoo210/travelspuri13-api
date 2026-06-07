import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { PricingService } from './pricing.service';
import { RateOverride } from './dto/rate-override.type';
import { CreateRateOverrideInput } from './dto/rate-override-input.type';

@Resolver(() => RateOverride)
@UseGuards(JwtAuthGuard)
export class PricingResolver {
  constructor(private readonly pricingService: PricingService) {}

  @Query(() => [RateOverride])
  async rateOverrides(
    @TenantId() tenantId: string,
  ): Promise<RateOverride[]> {
    const overrides = await this.pricingService.findRateOverrides(tenantId);
    return overrides as any;
  }

  @Mutation(() => RateOverride)
  async createRateOverride(
    @Args('input') input: CreateRateOverrideInput,
    @TenantId() tenantId: string,
  ): Promise<RateOverride> {
    const override = await this.pricingService.createRateOverride(tenantId, input);
    return override as any;
  }

  @Mutation(() => RateOverride)
  async deleteRateOverride(
    @Args('id', { type: () => ID }) id: string,
    @TenantId() tenantId: string,
  ): Promise<RateOverride> {
    const override = await this.pricingService.deleteRateOverride(id, tenantId);
    return override as any;
  }
}
