import { Module } from '@nestjs/common'
import { RoomController } from './room.controller'
import { RoomService } from './room.service'
import { RoomResolver } from './room.resolver'

@Module({
  controllers: [RoomController],
  providers: [RoomService, RoomResolver],
  exports: [RoomService],
})
export class RoomModule {}
