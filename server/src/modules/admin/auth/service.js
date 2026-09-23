import argon2 from 'argon2';

import { ERROR_CONFIG } from '../../../config/error.config.js';
import ApiError from '../../../utils/api.error.js';
import { createAdminSession } from '../session/repository.js';
import * as repository from './repository.js';

export async function login({ email, password }) {
  const admin = await repository.fetchAdminByEmail(email);

  if (!admin || !admin.passwordHash) {
    throw new ApiError(ERROR_CONFIG.INVALID_CREDENTIALS);
  }

  const isMatch = await argon2.verify(admin.passwordHash, password);

  if (!isMatch) {
    throw new ApiError(ERROR_CONFIG.INVALID_CREDENTIALS);
  }

  const sessionId = await createAdminSession(admin.id);

  return {
    sessionId,
    admin: {
      id: admin.id,
      email: admin.email,
    },
  };
}
