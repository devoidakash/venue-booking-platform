export const APPLICATION_ERROR_CONFIG = {
  VENDOR_NOT_FOUND: {
    statusCode: 404,
    message: 'Vendor not found',
    code: 'VENDOR_NOT_FOUND',
  },
  APPLICATION_NOT_PENDING: {
    statusCode: 409,
    message: 'No pending application found',
    code: 'APPLICATION_NOT_PENDING',
  },
  INVALID_STATUS: {
    statusCode: 400,
    message: 'Invalid application status',
    code: 'INVALID_APPLICATION_STATUS',
  },
};
