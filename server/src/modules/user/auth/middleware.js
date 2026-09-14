import jwt from 'jsonwebtoken';

import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { USER_AUTH_CONFIG } from './config.js';
import { findUserById } from './repository.js';

export async function authenticateToken(req, res, next) {
  const accessToken = req.cookies[USER_AUTH_CONFIG.ACCESS_COOKIE];

  if (!accessToken) {
    throw new ApiError(USER_ERROR_CONFIG.ACCESS_TOKEN_MISSING);
  }

  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_SECRET);

    if (typeof payload === 'object' && payload.sub) {
      req.user = { id: payload.sub };
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(USER_ERROR_CONFIG.TOKEN_EXPIRED);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new ApiError(USER_ERROR_CONFIG.INVALID_TOKEN);
    }

    throw err;
  }

  next();
}

export async function ensureAccountActive(req, res, next) {
  const user = await findUserById(pool, req.user.id);

  if (!user) {
    throw new ApiError(USER_ERROR_CONFIG.USER_NOT_FOUND);
  }

  if (user.status === 'banned') {
    throw new ApiError(USER_ERROR_CONFIG.ACCOUNT_DEACTIVATED);
  }
  req.user = user;
  next();
}
