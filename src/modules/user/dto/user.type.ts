import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@/generated/prisma/client';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => UserRole, { defaultValue: UserRole.STAFF })
  role!: UserRole;

  @Field()
  tenantId!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}
