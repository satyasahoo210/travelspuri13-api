import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { UserRole } from '@/generated/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { User } from './dto/user.type';
import { CreateUserInput } from './dto/user-input.type';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async createUser(
    @Args('input') input: CreateUserInput,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    const user = await this.userService.create(input, currentUser);
    return user as any;
  }

  @Query(() => [User])
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async users(
    @CurrentUser() currentUser: any,
  ): Promise<User[]> {
    const users = await this.userService.findAll(currentUser.tenantId, currentUser.role);
    return users as any;
  }

  @Query(() => User)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    const user = await this.userService.findOne(id, currentUser.tenantId, currentUser.role);
    return user as any;
  }

  @Mutation(() => User)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    const user = await this.userService.remove(id, currentUser.tenantId, currentUser.role, currentUser.id);
    return user as any;
  }
}
