import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/generated/prisma/client'
import { Controller, Param, Post, UseGuards } from '@nestjs/common'
import { NightAuditService } from './night-audit.service'

@Controller('night-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NightAuditController {
  constructor(private readonly nightAuditService: NightAuditService) {}

  @Post(':propertyId')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.TENANT_ADMIN)
  async runAudit(
    @Param('propertyId') propertyId: string,
    @TenantId() tenantId: string,
  ) {
    return this.nightAuditService.performNightAudit(tenantId, propertyId)
  }
}
