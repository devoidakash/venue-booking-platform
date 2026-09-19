import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import {
  sendVenueApprovalMail,
  sendVenueRejectionMail,
} from '../../email.service.js';
import { APPLICATION_ERROR_CONFIG } from './error.config.js';
import * as repository from './repository.js';

export async function getApplications(status) {
  const applications = await repository.fetchApplications(status);
  return Promise.all(
    applications.map(async (application) => {
      const [coverImage] = await getPrivateUrl([application.cover_image_key]);

      return {
        id: application.id,
        venueGroupId: application.venue_group_id,
        name: application.name,
        category: application.category,
        coverImage,
        district: application.district,
        state: application.state,
        status: application.status,
        submittedAt: application.submitted_at,
        reviewedAt: application.reviewed_at,
        rejectionReason: application.rejection_reason,
        vendor: {
          id: application.vendor_id,
          name: application.vendor_name,
        },
        reviewedBy: {
          id: application.reviewer_id,
          email: application.reviewer_email,
        },
      };
    })
  );
}

export async function getApplication(applicationId) {
  const application = await repository.fetchApplication(applicationId);

  if (!application) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.VENUE_APPLICATION_NOT_FOUND);
  }

  return {
    id: application.id,
    vendor_id: application.vendor_id,
    name: application.name,
    venue_details: application.venue_details,
    category: application.category,
    address: application.address,
    district: application.district,
    state: application.state,
    pincode: application.pincode,
    latitude: application.latitude,
    longitude: application.longitude,
    images: await getPrivateUrl(application.images),
    proofDocumentUrl: (
      await getPrivateUrl([application.proof_document_key])
    )[0],
    status: application.status,
    rejectionReason: application.rejection_reason,
    submittedAt: application.submitted_at,
    reviewedAt: application.reviewed_at,
    vendor: {
      id: application.vendor_id,
      name: application.vendor_name,
    },
    reviewedBy: {
      id: application.reviewer_id,
      email: application.reviewer_email,
    },
  };
}

export async function reviewApplication(reviewerId, applicationId, data) {
  if (data.status === 'rejected') {
    const result = await repository.markVenueAsRejected(
      reviewerId,
      applicationId,
      data
    );

    if (!result) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }

    try {
      await sendVenueRejectionMail({
        email: result.email,
        vendorName: result.vendorName,
        venueName: result.name,
        rejectionReason: result.rejectionReason,
      });
    } catch (error) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.EMAIL_SEND_FAILED);
    }

    return { id: result.id };
  }
  const result = await withTransaction(pool, async (client) => {
    const result = await repository.markVenueAsApproved(
      client,
      reviewerId,
      applicationId
    );
    if (!result) {
      throw new ApiError(APPLICATION_ERROR_CONFIG.APPLICATION_NOT_PENDING);
    }
    const vendor = await repository.findVendorContact(client, result.vendorId);
    const venue = await repository.createVenue(client, result);
    return {
      venue,
      email: vendor.email,
      vendorName: vendor.vendorName,
      venueName: result.name,
    };
  });

  try {
    await sendVenueApprovalMail(result);
  } catch (error) {
    throw new ApiError(APPLICATION_ERROR_CONFIG.EMAIL_SEND_FAILED);
  }

  return result.venue;
}

export async function getApplicationsCounts() {
  return repository.fetchApplicationsCounts();
}
