import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { UserRole } from '@/generated/prisma/client';
import { TenantService } from './tenant.service';
import { Tenant, CreateTenantResponse } from './dto/tenant.type';
import { CreateTenantInput } from './dto/tenant-input.type';

@Resolver()
export class TenantResolver {
  constructor(private readonly tenantService: TenantService) {}

  @Mutation(() => CreateTenantResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createTenant(
    @Args('input') input: CreateTenantInput,
  ): Promise<CreateTenantResponse> {
    const featureFlags = input.featureFlags ? JSON.parse(input.featureFlags) : undefined;
    const result = await this.tenantService.create({
      ...input,
      featureFlags,
    });

    return {
      tenant: {
        ...result.tenant,
        featureFlags: result.tenant.featureFlags ? JSON.stringify(result.tenant.featureFlags) : undefined,
      } as any,
      adminUser: result.adminUser,
    };
  }

  @Query(() => [Tenant])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async tenants(): Promise<Tenant[]> {
    const tenants = await this.tenantService.findAll();
    return tenants.map(t => ({
      ...t,
      featureFlags: t.featureFlags ? JSON.stringify(t.featureFlags) : undefined,
    })) as any;
  }

  @Query(() => Tenant, { nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  async tenant(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Tenant | null> {
    const tenant = await this.tenantService.findOne(id);
    if (!tenant) return null;
    return {
      ...tenant,
      featureFlags: tenant.featureFlags ? JSON.stringify(tenant.featureFlags) : undefined,
    } as any;
  }
}
