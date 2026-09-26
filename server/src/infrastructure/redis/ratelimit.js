import { Ratelimit } from '@upstash/ratelimit';

import { USER_AUTH_CONFIG } from '../../modules/user/auth/config.js';
import { redis } from './redis.js';

function rateLimiter(maxRequests, windowSize, prefixName) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowSize),
    prefix: prefixName,
  });
}

export const otpSendLimiter = rateLimiter(
  USER_AUTH_CONFIG.OTP_RATE_LIMIT_MAX_REQUESTS,
  USER_AUTH_CONFIG.OTP_RATE_LIMIT_WINDOW,
  USER_AUTH_CONFIG.OTP_RATE_LIMIT_PREFIX
);

export const otpVerifyEmailLimiter = rateLimiter(
  USER_AUTH_CONFIG.OTP_VERIFY_EMAIL_MAX_REQUESTS,
  USER_AUTH_CONFIG.OTP_VERIFY_EMAIL_RATE_LIMIT_WINDOW,
  USER_AUTH_CONFIG.OTP_VERIFY_EMAIL_RATE_LIMIT_PREFIX
);

export const otpVerifyIpLimiter = rateLimiter(
  USER_AUTH_CONFIG.OTP_VERIFY_IP_MAX_REQUESTS,
  USER_AUTH_CONFIG.OTP_VERIFY_IP_RATE_LIMIT_WINDOW,
  USER_AUTH_CONFIG.OTP_VERIFY_IP_RATE_LIMIT_PREFIX
);
