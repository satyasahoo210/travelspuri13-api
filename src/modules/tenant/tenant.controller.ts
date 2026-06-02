import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/generated/prisma/client'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantService } from './tenant.service'

@ApiBearerAuth()
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.tenantService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id)
  }
}
