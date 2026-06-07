import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { UserRole } from '@/generated/prisma/client';
import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { PropertyService } from './property.service';
import { Property } from './dto/property.type';
import { CreatePropertyInput, UpdatePropertyInput } from './dto/property-input.type';

@Resolver(() => Property)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @ResolveField(() => String, { nullable: true })
  settings(@Parent() property: any): string | null {
    if (!property.settings) return null;
    return typeof property.settings === 'object'
      ? JSON.stringify(property.settings)
      : property.settings;
  }

  @Mutation(() => Property)
  @Roles(UserRole.SUPER_ADMIN)
  async createProperty(
    @Args('input') input: CreatePropertyInput,
  ): Promise<Property> {
    const settings = input.settings ? JSON.parse(input.settings) : undefined;
    const property = await this.propertyService.create({
      ...input,
      settings,
    });

    return property as any;
  }

  @Mutation(() => Property)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async updateProperty(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePropertyInput,
  ): Promise<Property> {
    const settings = input.settings ? JSON.parse(input.settings) : undefined;
    const property = await this.propertyService.update(id, {
      ...input,
      ...(settings !== undefined && { settings }),
    });
    return property as any;
  }

  @Query(() => [Property])
  async properties(
    @TenantId() tenantId: string,
  ): Promise<Property[]> {
    const properties = await this.propertyService.findAll(tenantId);
    return properties as any;
  }

  @Query(() => Property, { nullable: true })
  async property(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Property | null> {
    const property = await this.propertyService.findOne(id);
    if (!property) return null;
    return property as any;
  }
}
