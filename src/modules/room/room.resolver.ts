import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { HousekeepingStatus } from '@/generated/prisma/client';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRoomInput, CreateRoomTypeInput, UpdateRoomInput, UpdateRoomTypeInput } from './dto/room-input.type';
import { Room, RoomType, SyncRoomsResponse, SyncRoomTypesResponse } from './dto/room.type';
import { RoomService } from './room.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  @Mutation(() => RoomType)
  async createRoomType(
    @Args('input') input: CreateRoomTypeInput,
  ): Promise<RoomType> {
    return this.roomService.createRoomType(input);
  }

  @Mutation(() => Room)
  async createRoom(
    @Args('input') input: CreateRoomInput,
  ): Promise<Room> {
    const room = await this.roomService.createRoom(input);
    return room as any;
  }

  @Query(() => [RoomType])
  async roomTypes(
    @Args('propertyId') propertyId: string,
  ): Promise<RoomType[]> {
    const roomTypes = await this.roomService.findRoomTypes(propertyId);
    return roomTypes as any;
  }

  @Query(() => SyncRoomsResponse)
  async syncRooms(
    @TenantId() tenantId: string,
    @Args('propertyId') propertyId: string,
    @Args('since', { nullable: true }) since?: string,
  ): Promise<SyncRoomsResponse> {
    const lastSync = since ? parseInt(since, 10) : 0;
    const result = await this.roomService.syncRooms(lastSync, propertyId, tenantId);
    return result as any;
  }

  @Query(() => SyncRoomTypesResponse)
  async syncRoomTypes(
    @TenantId() tenantId: string,
    @Args('propertyId') propertyId: string,
    @Args('since', { nullable: true }) since?: string,
  ): Promise<SyncRoomTypesResponse> {
    const lastSync = since ? parseInt(since, 10) : 0;
    const result = await this.roomService.syncRoomTypes(lastSync, propertyId, tenantId);
    return result as any;
  }

  @Mutation(() => RoomType)
  async updateRoomType(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRoomTypeInput,
  ): Promise<RoomType> {
    return this.roomService.updateRoomType(id, input);
  }

  @Mutation(() => Room)
  async updateRoom(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRoomInput,
  ): Promise<Room> {
    const room = await this.roomService.updateRoom(id, input);
    return room as any;
  }

  @Mutation(() => Room)
  async updateRoomStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => HousekeepingStatus }) status: HousekeepingStatus,
  ): Promise<Room> {
    const room = await this.roomService.updateRoomStatus(id, status);
    return room as any;
  }
}
