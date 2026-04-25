import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateRoomDto, CreateRoomTypeDto } from './dto/room.dto'
import { RoomService } from './room.service'
import { TenantId } from '@/common/decorators/tenant-id.decorator'

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

  @Get('sync')
  @ApiOperation({ summary: 'Sync rooms updated since timestamp' })
  sync(@Query('since') since: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.roomService.syncRooms(lastSync, tenantId)
  }
  @Get('room-types/sync')
  @ApiOperation({ summary: 'Sync room types updated since timestamp' })
  syncRoomTypes(@Query('since') since: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.roomService.syncRoomTypes(lastSync, tenantId)
  }
}
