import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateRoomDto, CreateRoomTypeDto } from './dto/room.dto'
import { RoomService } from './room.service'

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('room-type')
  @ApiOperation({ summary: 'Create a new room type' })
  createRoomType(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomService.createRoomType(createRoomTypeDto)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto)
  }

  @Get('room-types')
  @ApiOperation({ summary: 'Get all room types for a property' })
  findRoomTypes(@Query('propertyId') propertyId: string) {
    return this.roomService.findRoomTypes(propertyId)
  }
}
