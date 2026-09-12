import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import { APPLICATION_ERROR_CONFIG } from './error.config.js';
import * as repository from './repository.js';

export async function getApplications(status) {
  const applications = await repository.fetchApplications(status);
  return Promise.all(
    applications.map(async (item) => {
      return {
        id: item.id,
        vendor_id: item.vendor_id,
        name: item.name,
        venue_details: item.venue_details,
        category: item.category,
        address: item.address,
        district: item.district,
        state: item.state,
        pincode: item.pincode,
        geo_loc: item.geo_loc,
        images: await getPrivateUrl(item.images),
        proof_document_url: (await getPrivateUrl(item.proof_document_key))[0],
        rejection_reason: item.rejection_reason,
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by,
      };
    })
  );
}

export async function updateApplication(reviewerId, applicationId, data) {
  if (data.status === 'rejected') {
    const result = await repository.markVenueAsRejected(
      reviewerId,
      applicationId,
      data
    );

    if (!result) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }
    return result;
  }
  return withTransaction(pool, async (client) => {
    const result = await repository.markVenueAsApproved(
      client,
      reviewerId,
      applicationId
    );
    if (!result) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }
    return repository.createVenue(client, result);
  });
}

export async function getApplicationsCounts() {
  return repository.fetchApplicationsCounts();
}
