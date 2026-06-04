import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NightAuditResponse {
  @Field()
  success!: boolean;

  @Field()
  timestamp!: Date;
}
