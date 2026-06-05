import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
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

  @Get('sync')
  @ApiOperation({ summary: 'Sync rooms updated since timestamp' })
  sync(@Query('since') since: string, @Query('propertyId') propertyId: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.roomService.syncRooms(lastSync, propertyId, tenantId)
  }

  @Get('room-types/sync')
  @ApiOperation({ summary: 'Sync room types updated since timestamp' })
  syncRoomTypes(@Query('since') since: string, @Query('propertyId') propertyId: string, @TenantId() tenantId: string) {
    const lastSync = since ? parseInt(since, 10) : 0
    return this.roomService.syncRoomTypes(lastSync, propertyId, tenantId)
  }

  @Patch('room-type/:id')
  @ApiOperation({ summary: 'Update an existing room type' })
  updateRoomType(@Param('id') id: string, @Body() updateRoomTypeDto: any) {
    return this.roomService.updateRoomType(id, updateRoomTypeDto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing room' })
  updateRoom(@Param('id') id: string, @Body() updateRoomDto: any) {
    return this.roomService.updateRoom(id, updateRoomDto)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update room housekeeping status' })
  updateRoomStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.roomService.updateRoomStatus(id, status)
  }
}
