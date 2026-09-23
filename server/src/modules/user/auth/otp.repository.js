import { redis } from '../../../infrastructure/redis/redis.js';
import ApiError from '../../../utils/api.error.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { AUTH_CONFIG } from './config.js';

export async function checkCoolDown(email) {
  const key = `${AUTH_CONFIG.OTP_COOLDOWN_PREFIX}${email}`;

  const exists = await redis.get(key);

  if (exists) {
    const ttl = await redis.ttl(key);
    throw new ApiError({
      statusCode: 429,
      message: `Please wait ${ttl} seconds before requesting another OTP`,
      code: 'OTP_REQUEST_LIMIT',
    });
  }

  await redis.set(key, '1', { ex: AUTH_CONFIG.OTP_COOLDOWN_TTL });
}

export async function checkRateLimit(email) {
  const key = `${AUTH_CONFIG.OTP_RATE_LIMIT_PREFIX}${email}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, AUTH_CONFIG.OTP_RATE_LIMIT_TTL);
  }

  if (count > AUTH_CONFIG.OTP_MAX_REQUESTS) {
    throw new ApiError(USER_ERROR_CONFIG.OTP_RATE_LIMIT_EXCEEDED);
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
