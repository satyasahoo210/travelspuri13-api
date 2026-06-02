import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import 'multer';
import * as path from 'path';
import { StorageProvider } from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private uploadsRoot = path.join(process.cwd(), 'uploads');
  private appUrl: string;

  constructor(private configService: ConfigService) {
    super();
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    filePath: string,
  ): Promise<string> {
    try {
      const fullDir = path.join(this.uploadsRoot, bucket, path.dirname(filePath));
      const fullPath = path.join(this.uploadsRoot, bucket, filePath);

      await fs.promises.mkdir(fullDir, { recursive: true });
      await fs.promises.writeFile(fullPath, file.buffer);

      // Return local URL
      return `${this.appUrl}/uploads/${bucket}/${filePath}`;
    } catch (error: any) {
      throw new InternalServerErrorException(`Local upload failed: ${error.message}`);
    }
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadsRoot, bucket, filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error: any) {
      throw new InternalServerErrorException(`Local delete failed: ${error.message}`);
    }
  }

  async getSignedUrl(
    bucket: string,
    filePath: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    // For local storage, public URL is returned
    return `${this.appUrl}/uploads/${bucket}/${filePath}`;
  }
}
