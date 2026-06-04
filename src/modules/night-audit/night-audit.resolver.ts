import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { UserRole } from '@/generated/prisma/client';
import { TenantId } from '@/common/decorators/tenant-id.decorator';
import { NightAuditService } from './night-audit.service';
import { NightAuditResponse } from './dto/night-audit-response.type';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class NightAuditResolver {
  constructor(private readonly nightAuditService: NightAuditService) {}

  @Mutation(() => NightAuditResponse)
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.TENANT_ADMIN)
  async runNightAudit(
    @Args('propertyId') propertyId: string,
    @TenantId() tenantId: string,
  ): Promise<NightAuditResponse> {
    return this.nightAuditService.performNightAudit(tenantId, propertyId);
  }
}
