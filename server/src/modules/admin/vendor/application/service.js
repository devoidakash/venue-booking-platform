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
  const emailInfo = await withTransaction(pool, async (client) => {
    const application = await repository.markVendorAsApproved(client, {
      applicationId,
      status: 'approved',
      reviewedBy: reviewerId,
    });

    if (!application) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }

    await repository.createVendorProfile(client, application);
    const email = await repository.markUserAsVendor(
      client,
      application.user_id
    );
    return { email, vendorName: application.pan_name };
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
    throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
  }

  try {
    await sendVendorRejectionMail({
      email: application.email,
      vendorName: application.pan_name,
      rejectionReason: application.rejection_reason,
    });
  } catch (error) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.EMAIL_SEND_FAILED);
  }

  return application;
}

export async function getVendorProfile(vendorId) {
  const vendor = await repository.findVendorById(pool, vendorId);

  if (!vendor) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.VENDOR_NOT_FOUND);
  }

  return {
    id: vendor.id,
    vendorName: vendor.vendor_name,
    email: vendor.email,
    phone: vendor.phone,
    district: vendor.district,
    state: vendor.state,
    isSuspended: vendor.is_suspended,
    suspensionReason: vendor.suspension_reason,
    accountStatus: vendor.account_status,
    approvedAt: vendor.approved_at,
  };
}
