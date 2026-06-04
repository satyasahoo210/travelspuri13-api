import { Field, ID, Int, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RoomStatus, HousekeepingStatus } from '@/generated/prisma/client';

registerEnumType(RoomStatus, { name: 'RoomStatus' });
registerEnumType(HousekeepingStatus, { name: 'HousekeepingStatus' });

@ObjectType()
export class RoomType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  capacity!: number;

  @Field(() => Float, { nullable: true })
  defaultPrice?: any;

  @Field()
  propertyId!: string;

  @Field(() => [String], { defaultValue: [] })
  photos!: string[];

  @Field(() => [Room], { nullable: 'itemsAndList', defaultValue: [] })
  Room?: Room[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}

@ObjectType()
export class Room {
  @Field(() => ID)
  id!: string;

  @Field()
  roomNumber!: string;

  @Field(() => RoomStatus, { defaultValue: RoomStatus.AVAILABLE })
  status!: RoomStatus;

  @Field()
  roomTypeId!: string;

  @Field(() => HousekeepingStatus, { defaultValue: HousekeepingStatus.READY })
  housekeepingStatus!: HousekeepingStatus;

  @Field(() => Boolean, { defaultValue: false })
  priorityCleaning!: boolean;

  @Field(() => RoomType, { nullable: true })
  RoomType?: RoomType;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}

@ObjectType()
export class SyncRoomsResponse {
  @Field(() => [Room])
  data!: Room[];

  @Field(() => Float)
  timestamp!: number;
}

@ObjectType()
export class SyncRoomTypesResponse {
  @Field(() => [RoomType])
  data!: RoomType[];

  @Field(() => Float)
  timestamp!: number;
}
