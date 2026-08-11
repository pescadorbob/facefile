import Busboy from 'busboy';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export interface ParsedMultipart {
  fields: Record<string, string>;
  file: { buffer: Buffer; filename: string; mimeType: string } | null;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // matches middleware/upload.js's Multer limit

/**
 * Replaces middleware/upload.js's Multer disk storage: API Gateway hands the
 * proxy integration a base64-encoded body for `multipart/form-data` (see the
 * RestApi's `binaryMediaTypes` in amplify/backend.ts), which is parsed here
 * instead of being streamed to a local uploads/ directory.
 */
export function parseMultipart(event: APIGatewayProxyEvent): Promise<ParsedMultipart> {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] ?? event.headers['Content-Type'];
    if (!contentType) {
      reject(new Error('Missing Content-Type header'));
      return;
    }

    const bb = Busboy({ headers: { 'content-type': contentType }, limits: { fileSize: MAX_FILE_BYTES } });
    const fields: Record<string, string> = {};
    let file: ParsedMultipart['file'] = null;
    let fileTooLarge = false;

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('file', (_name, stream, info) => {
      if (!info.mimeType.startsWith('image/')) {
        stream.resume();
        reject(new Error('Only image files are allowed'));
        return;
      }
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('limit', () => {
        fileTooLarge = true;
      });
      stream.on('end', () => {
        if (!fileTooLarge) file = { buffer: Buffer.concat(chunks), filename: info.filename, mimeType: info.mimeType };
      });
    });

    bb.on('error', reject);
    bb.on('finish', () => {
      if (fileTooLarge) reject(new Error('File exceeds 5 MB limit'));
      else resolve({ fields, file });
    });

    const body = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64') : Buffer.from(event.body ?? '');
    bb.end(body);
  });
}
