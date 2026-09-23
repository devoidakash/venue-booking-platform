import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { fetchLatestApplicationStatus } from './repository.js';

export async function checkExistingApplication(req, res, next) {
  const application = await fetchLatestApplicationStatus(pool, req.user.id);

  if (application && application.status !== 'rejected') {
    throw new ApiError(USER_ERROR_CONFIG.APPLICATION_ALREADY_EXISTS);
  }

  next();
}
