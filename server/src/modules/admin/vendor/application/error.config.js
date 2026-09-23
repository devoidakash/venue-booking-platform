export const APPLICATION_ERROR_CONFIG = {
  VENDOR_NOT_FOUND: {
    statusCode: 404,
    message: 'Vendor not found',
    code: 'VENDOR_NOT_FOUND',
  },
  NO_PENDING_APPLICATIONS: {
    statusCode: 409,
    message: 'No pending application found',
    code: 'NO_PENDING_APPLICATIONS',
  },
  INVALID_STATUS: {
    statusCode: 400,
    message: 'Invalid application status',
    code: 'INVALID_APPLICATION_STATUS',
  },
};
