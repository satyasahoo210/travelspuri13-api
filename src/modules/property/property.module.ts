import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PropertyResolver } from './property.resolver';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
