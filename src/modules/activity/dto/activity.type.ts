import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class RecentActivity {
  @Field(() => ID)
  id!: string

  @Field()
  propertyId!: string

  @Field()
  tenantId!: string

  @Field()
  title!: string

  @Field()
  type!: string // 'clean', 'dirty', 'maintenance', 'payment', 'checkin'

  @Field()
  staffName!: string

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  updatedAt!: Date
}
