import {
  otpSendLimiter,
  otpVerifyEmailLimiter,
  otpVerifyIpLimiter,
} from '../../../infrastructure/redis/ratelimit.js';
import { redis } from '../../../infrastructure/redis/redis.js';
import ApiError from '../../../utils/api.error.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { AUTH_CONFIG } from './config.js';

export async function checkOtpRequestCoolDown(email) {
  const key = `${AUTH_CONFIG.OTP_COOLDOWN_PREFIX}${email}`;

  const result = await redis.set(key, '1', {
    nx: true,
    ex: AUTH_CONFIG.OTP_COOLDOWN_TTL,
  });

  if (result === null) {
    const ttl = await redis.ttl(key);
    throw new ApiError({
      statusCode: 429,
      message: `Please wait ${ttl} seconds before requesting a new OTP.`,
      code: 'OTP_REQUEST_COOLDOWN',
    });
  }
}

export async function deleteOtp(email) {
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  return redis.del(key);
}

export async function resetOtpRequestCoolDown(email) {
  const key = `${AUTH_CONFIG.OTP_COOLDOWN_PREFIX}${email}`;
  return redis.del(key);
}

export async function checkOtpRequestRateLimit(email) {
  const { success } = await otpSendLimiter.limit(email);

  if (!success) {
    throw new ApiError(USER_ERROR_CONFIG.OTP_REQUEST_LIMIT);
  }
}

export async function storeOtp(email, hashedOtp) {
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  await redis.set(key, hashedOtp, { ex: AUTH_CONFIG.OTP_TTL });
}

export async function checkVerifyOtpRateLimit(email, ip) {
  const emailResult = await otpVerifyEmailLimiter.limit(email);
  const ipResult = await otpVerifyIpLimiter.limit(ip);

  if (!emailResult.success || !ipResult.success) {
    throw new ApiError(USER_ERROR_CONFIG.OTP_VERIFY_RATE_LIMIT_EXCEEDED);
  }
}

export async function verifyAndDeleteOtp(email, hashedOtp) {
  const luaScript = `
  local stored = redis.call("GET", KEYS[1])
  if stored == ARGV[1] then
    redis.call("DEL", KEYS[1])
    return stored
  else
    return false
  end
  `;
  const key = `${AUTH_CONFIG.OTP_PREFIX}${email}`;
  return await redis.eval(luaScript, 1, key, hashedOtp);
}
