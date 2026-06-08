import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PublicResolver } from './public.resolver';

@Module({
  controllers: [PublicController],
  providers: [PublicService, PublicResolver],
  exports: [PublicService],
})
export class PublicModule {}
