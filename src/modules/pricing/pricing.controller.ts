import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PricingService } from './pricing.service'
import { SetPriceDto } from './dto/pricing.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/guards/roles.decorator'
import { UserRole } from '@/generated/prisma/client'

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set or update room pricing for a specific date' })
  async setPrice(@Body() setPriceDto: SetPriceDto) {
    return this.pricingService.setPrice(setPriceDto)
  }
}
