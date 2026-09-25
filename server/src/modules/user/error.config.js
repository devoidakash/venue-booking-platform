export const USER_ERROR_CONFIG = {
  ACCOUNT_DEACTIVATED: {
    statusCode: 403,
    message: 'Your account has been deactivated. Please contact support.',
    code: 'ACCOUNT_DEACTIVATED',
  },
  USER_NOT_FOUND: {
    statusCode: 401,
    message: 'User not exists',
    code: 'USER_NOT_FOUND',
  },
  INVALID_TOKEN: {
    statusCode: 401,
    message: 'Invalid token structure',
    code: 'INVALID_TOKEN',
  },
  INVALID_OR_EXPIRED_OTP: {
    statusCode: 400,
    message: 'Invalid or expired OTP',
    code: 'INVALID_OR_EXPIRED_OTP',
  },

  ACCESS_TOKEN_MISSING: {
    statusCode: 401,
    message: 'Authentication required.',
    code: 'ACCESS_TOKEN_MISSING',
  },
  APPLICATION_ALREADY_EXISTS: {
    statusCode: 409,
    message: 'Application already exists.',
    code: 'APPLICATION_ALREADY_EXISTS',
  },
  DOCUMENT_REQUIRED: {
    statusCode: 400,
    message: 'Verification document is required',
    code: 'DOCUMENT_REQUIRED',
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    message: 'Token has expired',
    code: 'TOKEN_EXPIRED',
  },
};
