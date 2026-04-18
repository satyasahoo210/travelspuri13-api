import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InventoryService } from './inventory.service'

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get availability for a room type and date range' })
  getAvailability(
    @Query('roomTypeId') roomTypeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryService.getAvailability(
      roomTypeId,
      new Date(startDate),
      new Date(endDate),
    )
  }
}
