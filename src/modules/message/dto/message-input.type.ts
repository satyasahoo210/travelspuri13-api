import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field({ defaultValue: 'OUTBOUND' })
  @IsString()
  @IsOptional()
  direction!: string;

  @Field({ defaultValue: 'SENT' })
  @IsString()
  @IsOptional()
  status!: string;

  @Field({ defaultValue: 'WHATSAPP' })
  @IsString()
  @IsOptional()
  channel!: string;
}
