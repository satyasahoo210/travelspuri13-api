import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateGuestDto } from './dto/create-guest.dto'
import { GuestService } from './guest.service'

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

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  findOne(@Param('id') id: string) {
    return this.guestService.findOne(id)
  }
}
