import path from 'path';

import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { deleteFromR2, uploadToR2 } from '../../../utils/r2.storage.js';
import { withTransaction } from '../../../utils/transaction.js';
import * as repository from './repository.js';

export async function getApplicationStatus(userId) {
  const application = await repository.fetchLatestApplicationStatus(userId);

  if (!application) {
    return { applicationStatus: 'not_applied' };
  }

  return application;
}

export async function submitApplication(userId, data, file) {
  const fileExtension = path.extname(file.originalname);
  const documentKey = `vendor-application/${userId}/${Date.now()}-pan${fileExtension}`;
  let upload = false;
  try {
    await uploadToR2(file.buffer, documentKey, file.mimetype);
    upload = true;
    return await withTransaction(pool, async (client) => {
      return await repository.insertVendorApplication(client, {
        userId,
        ...data,
        documentKey,
      });
    });
  } catch (err) {
    if (upload) {
      await deleteFromR2(documentKey);
    }
    throw err;
  }
}
