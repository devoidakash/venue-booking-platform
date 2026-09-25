import { Ratelimit } from '@upstash/ratelimit';

import { AUTH_CONFIG } from '../../modules/user/auth/config.js';
import { redis } from './redis.js';

function rateLimiter(maxRequests, windowSize, prefixName) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowSize),
    prefix: prefixName,
  });
}

export const otpSendLimiter = rateLimiter(
  AUTH_CONFIG.OTP_RATE_LIMIT_MAX_REQUESTS,
  AUTH_CONFIG.OTP_RATE_LIMIT_WINDOW,
  AUTH_CONFIG.OTP_RATE_LIMIT_PREFIX
);

export const otpVerifyEmailLimiter = rateLimiter(
  AUTH_CONFIG.OTP_VERIFY_EMAIL_MAX_REQUESTS,
  AUTH_CONFIG.OTP_VERIFY_EMAIL_RATE_LIMIT_WINDOW,
  AUTH_CONFIG.OTP_VERIFY_EMAIL_RATE_LIMIT_PREFIX
);

export const otpVerifyIpLimiter = rateLimiter(
  AUTH_CONFIG.OTP_VERIFY_IP_MAX_REQUESTS,
  AUTH_CONFIG.OTP_VERIFY_IP_RATE_LIMIT_WINDOW,
  AUTH_CONFIG.OTP_VERIFY_IP_RATE_LIMIT_PREFIX
);
