import { ERROR_CONFIG } from '../../../config/error.config.js';
import ApiError from '../../../utils/api.error.js';
import { getAdminSession } from '../session/repository.js';
import { ADMIN_AUTH_CONFIG } from './config.js';

export default async function validateAdminSession(req, res, next) {
  const sessionId = req.cookies[ADMIN_AUTH_CONFIG.COOKIE_NAME];

  if (!sessionId) {
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }

  const data = await getAdminSession(sessionId);

  if (!data) {
    res.clearCookie(
      ADMIN_AUTH_CONFIG.COOKIE_NAME,
      ADMIN_AUTH_CONFIG.ADMIN_CLEAR_COOKIE_OPTIONS
    );
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }

  req.admin = {
    id: data.adminId,
  };

  next();
}
