import { randomUUID } from 'crypto';
import path from 'path';

import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { deleteFromR2, uploadToR2 } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import ERROR_CONFIG from './error.config.js';
import { findVenueGroupId, insertIntoVenueApplications } from './repository.js';

export async function processSubmission(vendorId, data, files) {
  const proofDocument = files.proofDocument[0];
  const coverImage = files.coverImage[0];
  const proofDocumentKey = `venue-application/${vendorId}/${Date.now()}-venueProof${path.extname(proofDocument.originalname)}`;
  const coverImageKey = `venue-application/${vendorId}/${Date.now()}-venueCoverImage${path.extname(coverImage.originalname)}`;
  const venueImagesKey = files.venueImages.map((image, index) => {
    return `venue-application/${vendorId}/${Date.now()}-${index}-venueImages${path.extname(image.originalname)}`;
  });
  const uploadedKeys = [];

  try {
    await uploadToR2(
      proofDocument.buffer,
      proofDocumentKey,
      proofDocument.mimetype
    );
    uploadedKeys.push(proofDocumentKey);

    await uploadToR2(coverImage.buffer, coverImageKey, coverImage.mimetype);
    uploadedKeys.push(coverImageKey);

    for (const [index, image] of files.venueImages.entries()) {
      await uploadToR2(image.buffer, venueImagesKey[index], image.mimetype);

      uploadedKeys.push(venueImagesKey[index]);
    }

    let venueGroupId;

    if (data.venueGroupId) {
      const result = await findVenueGroupId(vendorId, data.venueGroupId);
      if (!result || !result.venue_group_id) {
        throw new ApiError(ERROR_CONFIG.NO_EXISTING_VENUE_FOUND);
      }
      venueGroupId = result.venue_group_id;
    } else {
      venueGroupId = randomUUID();
    }

    return await withTransaction(pool, async (client) => {
      return await insertIntoVenueApplications(client, {
        ...data,
        vendorId,
        venueGroupId,
        images: venueImagesKey,
        proofDocumentKey,
        coverImageKey,
      });
    });
  } catch (err) {
    for (const key of uploadedKeys) {
      await deleteFromR2(key);
    }

    throw err;
  }
}
