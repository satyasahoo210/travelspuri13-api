import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { RoomType } from '../../room/dto/room.type';

@ObjectType()
export class Property {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field()
  timezone!: string;

  @Field()
  tenantId!: string;

  @Field(() => Float, { nullable: true })
  taxPercentage?: number | null;

  @Field(() => String, { nullable: true })
  logoUrl?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => Date, { nullable: true })
  checkInTime?: Date | null;

  @Field(() => Date, { nullable: true })
  checkOutTime?: Date | null;

  @Field(() => String, { nullable: true })
  settings?: string | null; // JSON string

  @Field(() => [String], { defaultValue: [] })
  photos!: string[];

  @Field(() => [RoomType], { nullable: 'itemsAndList', defaultValue: [] })
  RoomType?: RoomType[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}
