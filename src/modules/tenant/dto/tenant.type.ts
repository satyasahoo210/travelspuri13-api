import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Tenant {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  featureFlags?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}

@ObjectType()
export class TenantAdminUser {
  @Field()
  email!: string;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class CreateTenantResponse {
  @Field(() => Tenant)
  tenant!: Tenant;

  @Field(() => TenantAdminUser)
  adminUser!: TenantAdminUser;
}
