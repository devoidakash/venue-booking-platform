import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import {
  sendVendorApprovalMail,
  sendVendorRejectionMail,
} from '../../email.service.js';
import { APPLICATION_ERROR_CONFIG } from './error.config.js';
import * as repository from './repository.js';

export async function getApplicationsCounts() {
  return repository.fetchApplicationsCounts();
}

export async function getApplications(status) {
  const applications = await repository.fetchApplicationsByStatus(pool, status);

  return Promise.all(
    applications.map(async (item) => {
      return {
        id: item.id,
        panName: item.panName,
        phone: item.phone,
        address: item.address,
        district: item.district,
        state: item.state,
        pincode: item.pincode,
        panNumber: item.panNumber,
        panDocumentUrl: (await getPrivateUrl([item.panDocumentKey]))[0],
        status: item.status,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt,
        rejectionReason: item.rejectionReason,
      };
    })
  );
}

export async function reviewApplication(reviewerId, applicationId, data) {
  if (data.status === 'approved') {
    return handleApproved(reviewerId, applicationId);
  }

  return handleRejected(reviewerId, applicationId, data.rejectionReason);
}

async function handleApproved(reviewerId, applicationId) {
  const emailInfo = await withTransaction(pool, async (client) => {
    const application = await repository.markVendorAsApproved(client, {
      applicationId,
      reviewedBy: reviewerId,
    });

    if (!application) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.NO_PENDING_APPLICATIONS);
    }

    await repository.createVendorProfile(client, application);
    const email = await repository.markUserAsVendor(client, application.userId);
    return { email, vendorName: application.panName };
  });
  try {
    await sendVendorApprovalMail(emailInfo);
    return;
  } catch (error) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.EMAIL_SEND_FAILED);
  }
}

async function handleRejected(reviewerId, applicationId, rejectionReason) {
  const application = await repository.markVendorAsRejected(pool, {
    applicationId,
    rejectionReason,
    reviewerId,
  });

  if (!application) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.NO_PENDING_APPLICATIONS);
  }

  try {
    await sendVendorRejectionMail({
      email: application.email,
      vendorName: application.panName,
      rejectionReason: application.rejectionReason,
    });
  } catch (error) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.EMAIL_SEND_FAILED);
  }

  return application;
}

export async function getVendorProfile(vendorId) {
  const vendor = await repository.fetchVenodrProfile(pool, vendorId);

  if (!vendor) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.VENDOR_NOT_FOUND);
  }
  return vendor;
}
