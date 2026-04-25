import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateGuestDto } from './dto/create-guest.dto'
import { GuestService } from './guest.service'
import { TenantId } from '@/common/decorators/tenant-id.decorator'

@ApiTags('Guest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new guest' })
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestService.create(createGuestDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all guests' })
  findAll() {
    return this.guestService.findAll()
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sync guests updated since timestamp' })
  sync(@Query('since') since: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.guestService.syncGuests(lastSync, tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  findOne(@Param('id') id: string) {
    return this.guestService.findOne(id)
  }
}
