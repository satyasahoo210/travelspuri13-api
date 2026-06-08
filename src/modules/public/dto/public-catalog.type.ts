import { Field, ID, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicHotel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field()
  location!: string;

  @Field()
  area!: string;

  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;

  @Field(() => Float)
  rating!: number;

  @Field(() => Int)
  rating_count!: number;

  @Field(() => Float)
  starting_price!: number;

  @Field()
  amenities!: string;

  @Field()
  amenities_search!: string;

  @Field()
  cover_image!: string;

  @Field(() => [String])
  image_urls!: string[];

  @Field(() => Boolean)
  is_sponsored!: boolean;

  @Field(() => Boolean)
  is_active!: boolean;

  @Field()
  created_at!: string;
}

@ObjectType()
export class PublicRoom {
  @Field(() => ID)
  id!: string;

  @Field()
  hotel_id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  price!: number;

  @Field(() => Int)
  capacity!: number;

  @Field()
  amenities!: string;

  @Field()
  amenities_search!: string;

  @Field(() => [String])
  image_urls!: string[];

  @Field()
  check_in!: string;

  @Field()
  check_out!: string;

  @Field()
  rules!: string;

  @Field()
  cancellation_policy!: string;

  @Field(() => Boolean)
  is_active!: boolean;
}
