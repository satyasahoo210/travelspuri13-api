import { Module } from '@nestjs/common';
import { NightAuditService } from './night-audit.service';
import { NightAuditController } from './night-audit.controller';
import { NightAuditResolver } from './night-audit.resolver';

@Module({
  controllers: [NightAuditController],
  providers: [NightAuditService, NightAuditResolver],
  exports: [NightAuditService],
})
export class NightAuditModule {}
