import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  bookingId?: string | null;

  @Field()
  guestId!: string;

  @Field()
  tenantId!: string;

  @Field()
  content!: string;

  @Field()
  direction!: string;

  @Field(() => String, { nullable: true })
  status?: string | null;

  @Field(() => String, { nullable: true })
  channel?: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;
}
