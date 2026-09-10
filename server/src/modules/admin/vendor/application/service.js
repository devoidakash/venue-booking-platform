import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import { APPLICATION_ERROR_CONFIG } from './error.config.js';
import {
  createVendorProfile,
  findApplicationsByStatus,
  getStatusCount,
  markUserAsVendor,
  markVendorAsApproved,
  markVendorAsRejected,
} from './repository.js';

export async function getApplications(status) {
  const applications = await findApplicationsByStatus(pool, status);

  return Promise.all(
    applications.map(async (item) => {
      return {
        id: item.id,
        pan_name: item.pan_name,
        phone: item.phone,
        address: item.address,
        district: item.district,
        state: item.state,
        pincode: item.pincode,
        pan_number: item.pan_number,
        pan_document_url: await getPrivateUrl(item.pan_document_key),
        status: item.status,
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by,
        rejection_reason: item.rejection_reason,
      };
    })
  );
}

export async function reviewApplication(reviewerId, applicationId, data) {
  if (data.status === 'approved') {
    return handleApproved(reviewerId, applicationId);
  }

  return handleRejected(reviewerId, applicationId, data.rejection_reason);
}

async function handleApproved(reviewerId, applicationId) {
  await withTransaction(pool, async (client) => {
    const application = await markVendorAsApproved(client, {
      applicationId,
      status: 'approved',
      reviewedBy: reviewerId,
    });

    if (!application) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }

    await createVendorProfile(client, application);
    await markUserAsVendor(client, application.user_id);
  });
}

async function handleRejected(reviewerId, applicationId, rejectionReason) {
  const application = await markVendorAsRejected(pool, {
    applicationId,
    rejectionReason,
    reviewerId,
  });

  if (!application) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
  }
  return application;
}

export async function getApplicationsCount() {
  return getStatusCount(pool);
}
