export const ERROR_CONFIG = {
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: 'Invalid email or password',
    code: 'INVALID_CREDENTIALS',
  },
  SESSION_EXPIRED: {
    statusCode: 401,
    message: 'Your session has expired, please login again',
    code: 'SESSION_EXPIRED',
  },
  UNAUTHORIZED_REQUEST: {
    statusCode: 401,
    message: 'You are not authorized to perform this action',
    code: 'UNAUTHORIZED_REQUEST',
  },
  CREDENTIALS_REQUIRED: {
    statusCode: 401,
    message: 'Credentials are required',
    code: 'CREDENTIALS_REQUIRED',
  },

  VALIDATION_ERROR: {
    statusCode: 422,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
  },
  BODY_REQUIRED: {
    statusCode: 400,
    message: 'Request body is required',
    code: 'BODY_REQUIRED',
  },
  FILE_REQUIRED: {
    statusCode: 400,
    message: 'File is required',
    code: 'FILE_REQUIRED',
  },
  FILES_REQUIRED: {
    statusCode: 400,
    message: 'Files are required',
    code: 'FILES_REQUIRED',
  },
  EMAIL_SEND_FAILED: {
    statusCode: 500,
    message: 'Failed to send OTP email',
    code: 'EMAIL_SEND_FAILED',
  },
  FORBIDDEN_ACCESS: {
    statusCode: 403,
    message: 'You do not have permission to access this resource',
    code: 'FORBIDDEN_ACCESS',
  },
  INVALID_FILE_CONTENT: {
    statusCode: 400,
    message: 'Unable to determine file type.',
    code: 'INVALID_FILE_CONTENT',
  },
  FILE_TYPE_MISMATCH: {
    statusCode: 400,
    message: 'Invalid file type. Only JPEG, JPG and PNG are allowed.',
    code: 'FILE_TYPE_MISMATCH',
  },
  ADMIN_NOT_FOUND: {
    statusCode: 404,
    message: 'Admin not found',
    code: 'ADMIN_NOT_FOUND',
  },
};
