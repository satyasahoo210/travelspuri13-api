import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Guest {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  idProofType?: string | null;

  @Field(() => String, { nullable: true })
  idProofNumber?: string | null;

  @Field()
  tenantId!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  idProofUrl?: string | null;

  @Field(() => String, { nullable: true })
  gstin?: string | null;

  @Field(() => String, { nullable: true })
  grNumber?: string | null;

  @Field(() => String, { nullable: true })
  preferences?: string | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;
}

@ObjectType()
export class SyncGuestsResponse {
  @Field(() => [Guest])
  data!: Guest[];

  @Field(() => Float)
  timestamp!: number;
}
