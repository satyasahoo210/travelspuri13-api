import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { RoomType } from '../../room/dto/room.type';

@ObjectType()
export class RateOverride {
  @Field(() => ID)
  id!: string;

  @Field()
  roomTypeId!: string;

  @Field()
  tenantId!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date)
  endDate!: Date;

  @Field(() => Float)
  rate!: number;

  @Field(() => RoomType, { nullable: true })
  RoomType?: RoomType;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
