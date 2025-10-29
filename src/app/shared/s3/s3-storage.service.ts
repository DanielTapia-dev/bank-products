import { Injectable } from '@angular/core';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './cognito-s3.client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class S3StorageService {
  private readonly s3Cfg = environment.aws.s3;
  private readonly region = environment.aws.region;

  private ensurePrefix(prefix?: string): string {
    if (!prefix) return '';
    return prefix.endsWith('/') ? prefix : `${prefix}/`;
  }

  async upload(file: File): Promise<string> {
    const { bucket, prefix, allowedTypes, maxSizeMB, publicBaseUrl } = this.s3Cfg;

    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`El archivo supera ${maxSizeMB}MB`);
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo no permitido: ${file.type}`);
    }

    // eslint-disable-next-line no-useless-escape
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const key = `${this.ensurePrefix(prefix)}${Date.now()}-${safeName}`;

    const body = new Uint8Array(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream',
      }),
    );

    const baseUrl =
      publicBaseUrl && publicBaseUrl.trim().length > 0
        ? publicBaseUrl.replace(/\/+$/, '')
        : `https://${bucket}.s3.${this.region}.amazonaws.com`;

    return `${baseUrl}/${key}`;
  }
}
