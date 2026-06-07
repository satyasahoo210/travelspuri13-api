import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { MessageService } from './message.service';
import { Message } from './dto/message.type';
import { CreateMessageInput } from './dto/message-input.type';

@Resolver(() => Message)
@UseGuards(JwtAuthGuard)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query(() => [Message])
  async messages(
    @Args('guestId') guestId: string,
    @TenantId() tenantId: string,
  ): Promise<Message[]> {
    const messages = await this.messageService.findAllByGuest(guestId, tenantId);
    return messages as any;
  }

  @Mutation(() => Message)
  async createMessage(
    @Args('input') input: CreateMessageInput,
    @TenantId() tenantId: string,
  ): Promise<Message> {
    const message = await this.messageService.create(tenantId, input);
    return message as any;
  }
}
