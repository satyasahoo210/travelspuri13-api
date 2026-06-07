import { Module } from '@nestjs/common';
import { DevDbResolver } from './dev-db.resolver';

@Module({
  providers: [DevDbResolver],
})
export class DevDbModule {}
