import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { r2 } from '../infrastructure/s3/s3.js';

export async function uploadToR2(file, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2.send(command);
}

export async function deleteFromR2(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await r2.send(command);
}

export async function getPrivateUrl(keys) {
  return Promise.all(
    keys.map(async (key) => {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      });

      return getSignedUrl(r2, command, {
        expiresIn: 600,
      });
    })
  );
}
