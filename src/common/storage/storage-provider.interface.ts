import { Injectable } from '@nestjs/common';
import 'multer';

@Injectable()
export abstract class StorageProvider {
  /**
   * Upload a file to storage and return its public or accessible URL.
   */
  abstract uploadFile(
    file: Express.Multer.File,
    bucket: string,
    path: string,
  ): Promise<string>;

  /**
   * Delete a file from storage.
   */
  abstract deleteFile(bucket: string, path: string): Promise<void>;

  /**
   * Get a signed URL for a private file.
   */
  abstract getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds?: number,
  ): Promise<string>;
}
