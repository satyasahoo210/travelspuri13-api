import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DevEntitiesResponse {
  @Field()
  dataJson!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class DevDropdownsResponse {
  @Field()
  properties!: string;

  @Field()
  roomTypes!: string;

  @Field()
  guests!: string;

  @Field()
  products!: string;

  @Field()
  rooms!: string;

  @Field()
  bookings!: string;
}
