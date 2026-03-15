import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
    );

    this.bucket = this.configService.get<string>('S3_BUCKET') || '';
    this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL');

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle:
        this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  async uploadAudio(buffer: Buffer, mimeType: string, originalName: string) {
    this.ensureConfig();

    const key = `audio/${uuid()}${extname(originalName || '')}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      key,
      url: this.buildPublicUrl(key),
    };
  }

  async deleteObjectByKey(key: string) {
    this.ensureConfig();
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async deleteObjectByUrl(url: string) {
    if (!url) return;

    const key = this.extractKeyFromUrl(url);
    if (!key) {
      this.logger.warn(`Cannot derive S3 key from URL: ${url}`);
      return;
    }

    await this.deleteObjectByKey(key);
  }

  private ensureConfig() {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3_BUCKET is not configured');
    }
  }

  private buildPublicUrl(key: string) {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  private extractKeyFromUrl(urlString: string): string | null {
    try {
      const url = new URL(urlString);
      const pathname = url.pathname.replace(/^\//, '');

      if (this.publicBaseUrl && urlString.startsWith(this.publicBaseUrl)) {
        const base = this.publicBaseUrl.replace(/\/$/, '');
        return urlString.replace(`${base}/`, '');
      }

      if (!pathname) return null;

      const segments = pathname.split('/');
      if (segments[0] === this.bucket) {
        return segments.slice(1).join('/');
      }

      if (url.hostname.startsWith(`${this.bucket}.`)) {
        return pathname;
      }

      return pathname;
    } catch {
      return null;
    }
  }
}
