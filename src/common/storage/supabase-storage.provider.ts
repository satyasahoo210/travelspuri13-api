import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import 'multer';
import { StorageProvider } from './storage-provider.interface';

@Injectable()
export class SupabaseStorageProvider extends StorageProvider implements OnModuleInit {
  private supabase!: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    super();
  }

  onModuleInit() {
    this.supabase = this.supabaseService.getClient();
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    filePath: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(`Supabase upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new InternalServerErrorException(`Supabase file deletion failed: ${error.message}`);
    }
  }

  async getSignedUrl(
    bucket: string,
    filePath: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      throw new InternalServerErrorException(`Supabase signed URL generation failed: ${error.message}`);
    }

    return data.signedUrl;
  }
}
