import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Guest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new guest' })
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestService.create(createGuestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all guests' })
  findAll() {
    return this.guestService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  findOne(@Param('id') id: string) {
    return this.guestService.findOne(id);
  }
}
