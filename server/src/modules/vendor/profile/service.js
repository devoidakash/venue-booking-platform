import { ERROR_CONFIG } from '../../../config/error.config.js';
import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { getPrivateUrl } from '../../../utils/r2.storage.js';
import { USER_ERROR_CONFIG } from '../../user/error.config.js';
import { VENDOR_ERROR_CONFIG } from '../error.config.js';
import { findVendorProfileByUserId } from './repository.js';

export async function fetchVendorProfile(user) {
  const result = await findVendorProfileByUserId(pool, user.id);

  if (!result) {
    throw new ApiError(VENDOR_ERROR_CONFIG.VENDOR_NOT_FOUND);
  }
  const data = {
    vendorName: result.vendor_name,
    phone: result.phone,
    district: result.district,
    state: result.state,
    isSuspended: result.is_suspended,
    suspensionReason: result.suspension_reason,
    approvedAt: result.approved_at,
    panDocumentUrl: result.pan_document_key
      ? (await getPrivateUrl([result.pan_document_key]))[0]
      : null,
  };

  return { ...user, ...data };
}
