import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import { APPLICATION_ERROR_CONFIG } from './error.config.js';
import * as repository from './repository.js';

export async function getApplications(status) {
  const applications = await repository.findApplicationsByStatus(pool, status);

  return Promise.all(
    applications.map(async (item) => {
      return {
        id: item.id,
        panName: item.pan_name,
        phone: item.phone,
        address: item.address,
        district: item.district,
        state: item.state,
        pincode: item.pincode,
        panNumber: item.pan_number,
        panDocumentUrl: (await getPrivateUrl([item.pan_document_key]))[0],
        status: item.status,
        submittedAt: item.submitted_at,
        reviewedAt: item.reviewed_at,
        rejectionReason: item.rejection_reason,
      };
    })
  );
}

export async function updateApplication(reviewerId, applicationId, data) {
  if (data.status === 'approved') {
    return handleApproved(reviewerId, applicationId);
  }

  return handleRejected(reviewerId, applicationId, data.rejectionReason);
}

async function handleApproved(reviewerId, applicationId) {
  await withTransaction(pool, async (client) => {
    const application = await repository.markVendorAsApproved(client, {
      applicationId,
      status: 'approved',
      reviewedBy: reviewerId,
    });

    if (!application) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }

    await repository.createVendorProfile(client, application);
    await repository.markUserAsVendor(client, application.user_id);
  });
}

async function handleRejected(reviewerId, applicationId, rejectionReason) {
  const application = await repository.markVendorAsRejected(pool, {
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
  return repository.getStatusCount(pool);
}
