import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/generated/prisma/client'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SetPriceDto } from './dto/pricing.dto'
import { PricingService } from './pricing.service'

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @Roles(UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Set or update room pricing for a specific date' })
  async setPrice(
    @Body() setPriceDto: SetPriceDto,
    @TenantId() tenantId: string,
  ) {
    return this.pricingService.setPrice(setPriceDto, tenantId)
  }
}
