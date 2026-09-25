import { stat } from 'node:fs';

import { otpRateLimiter } from '../../../infrastructure/redis/ratelimit.js';
import { redis } from '../../../infrastructure/redis/redis.js';
import ApiError from '../../../utils/api.error.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { AUTH_CONFIG } from './config.js';

export async function checkCoolDown(email) {
  const key = `${AUTH_CONFIG.OTP_COOLDOWN_PREFIX}${email}`;

  const result = await redis.set(key, '1', {
    nx: true,
    ex: AUTH_CONFIG.OTP_COOLDOWN_TTL,
  });

  if (result === null) {
    const ttl = await redis.ttl(key);
    throw new ApiError({
      statusCode: 429,
      message: `Please wait ${ttl} seconds before requesting another OTP`,
      code: 'OTP_REQUEST_LIMIT',
    });
  }
}

export async function checkRateLimit(email) {
  const { success, reset } = await otpRateLimiter.limit(email);

  if (!success) {
    const remainingMinutes = Math.ceil((reset - Date.now()) / (1000 * 60));

    throw new ApiError({
      statusCode: 429,
      message: `Too many OTP requests. Please try again in ${remainingMinutes} minutes.`,
      code: 'OTP_RATE_LIMIT_EXCEEDED',
    });
  }
}

export async function storeOtp(email, hashedOtp) {
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  await redis.set(key, hashedOtp, { ex: AUTH_CONFIG.OTP_TTL });
}

export async function getOtp(email) {
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  return await redis.get(key);
}

export async function deleteOtp(email) {
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  await redis.del(key);
}
