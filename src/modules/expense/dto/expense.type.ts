import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Expense {
  @Field(() => ID)
  id!: string;

  @Field()
  propertyId!: string;

  @Field()
  tenantId!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  category!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  date?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
