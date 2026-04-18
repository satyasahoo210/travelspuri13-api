import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { Feature, FeatureGuard } from '@/common/guards/feature.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/generated/prisma/client'
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { FnBService } from './fnb.service'

@Controller('fnb')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
export class FnBController {
  constructor(private readonly fnbService: FnBService) {}

  @Post('order')
  @Roles(UserRole.STAFF, UserRole.PROPERTY_MANAGER)
  @Feature('FNB_MODULE')
  async createOrder(@Body() data: any, @TenantId() tenantId: string) {
    return this.fnbService.createOrder({ ...data, tenantId })
  }

  @Get('products')
  @Roles(UserRole.STAFF, UserRole.PROPERTY_MANAGER)
  @Feature('FNB_MODULE')
  async getProducts(
    @Query('category') category: string,
    @TenantId() tenantId: string,
  ) {
    return this.fnbService.getProducts(tenantId, category)
  }
}
