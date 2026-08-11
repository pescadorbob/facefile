import { extname } from 'path';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3';
import { requiredEnv } from './env';

// Replaces middleware/upload.js's Multer disk filename scheme
// (`${Date.now()}-${random}${ext}`) — the randomUUID prefix serves the same
// collision-avoidance purpose.
export async function uploadPhoto(file: { buffer: Buffer; filename: string; mimeType: string }): Promise<string> {
  const bucket = requiredEnv('PHOTOS_BUCKET_NAME');
  const key = `photos/${randomUUID()}${extname(file.filename)}`;
  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.mimeType }),
  );
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
