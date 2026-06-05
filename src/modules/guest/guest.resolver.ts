import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateGuestInput, UpdateGuestInput } from './dto/guest-input.type';
import { Guest, SyncGuestsResponse } from './dto/guest.type';
import { GuestService } from './guest.service';

@Resolver(() => Guest)
@UseGuards(JwtAuthGuard)
export class GuestResolver {
  constructor(private readonly guestService: GuestService) {}

  @Mutation(() => Guest)
  async createGuest(
    @Args('input') input: CreateGuestInput,
  ): Promise<Guest> {
    const guest = await this.guestService.create(input);
    return guest as any;
  }

  @Query(() => [Guest])
  async guests(
    @TenantId() tenantId?: string,
  ): Promise<Guest[]> {
    const guests = await this.guestService.findAll(tenantId);
    return guests as any;
  }

  @Query(() => Guest, { nullable: true })
  async guest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Guest | null> {
    const guest = await this.guestService.findOne(id);
    return guest as any;
  }

  @Query(() => SyncGuestsResponse)
  async syncGuests(
    @TenantId() tenantId: string,
    @Args('since', { nullable: true }) since?: string,
  ): Promise<SyncGuestsResponse> {
    const lastSync = since ? parseInt(since, 10) : 0;
    const result = await this.guestService.syncGuests(lastSync, tenantId);
    return result as any;
  }

  @Mutation(() => Guest)
  async updateGuest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGuestInput,
  ): Promise<Guest> {
    const guest = await this.guestService.update(id, input);
    return guest as any;
  }
}
