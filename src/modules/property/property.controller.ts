import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/generated/prisma/client'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreatePropertyDto } from './dto/create-property.dto'
import { PropertyService } from './property.service'
import { TenantId } from '@/common/decorators/tenant-id.decorator'

@ApiTags('Property')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new property (Admin only)' })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  findAll(@TenantId() tenantId: string) {
    return this.propertyService.findAll(tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id)
  }
}
