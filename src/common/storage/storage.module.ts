import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage-provider.interface';
import { LocalStorageProvider } from './local-storage.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';

@Global()
@Module({
  providers: [
    LocalStorageProvider,
    SupabaseStorageProvider,
    {
      provide: StorageProvider,
      useFactory: (
        configService: ConfigService,
        localProvider: LocalStorageProvider,
        supabaseProvider: SupabaseStorageProvider,
      ) => {
        const provider = configService.get<string>('STORAGE_PROVIDER') || 'local';
        return provider.toLowerCase() === 'supabase' ? supabaseProvider : localProvider;
      },
      inject: [ConfigService, LocalStorageProvider, SupabaseStorageProvider],
    },
  ],
  exports: [StorageProvider],
})
export class StorageModule {}
