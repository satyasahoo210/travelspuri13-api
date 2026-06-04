import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantResolver } from './tenant.resolver';

@Module({
  providers: [TenantService, TenantResolver],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}
