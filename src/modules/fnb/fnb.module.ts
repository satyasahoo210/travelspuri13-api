import { Module } from '@nestjs/common';
import { FnBService } from './fnb.service';
import { FnBController } from './fnb.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [FnBController],
  providers: [FnBService],
})
export class FnBModule {}
