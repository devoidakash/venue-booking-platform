import { Ratelimit } from '@upstash/ratelimit';

import AUTH_CONFIG from '../../config/config.js';
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

export const emailRateLimiter = rateLimiter(
  AUTH_CONFIG.EMAIL_MAX_REQUESTS,
  AUTH_CONFIG.EMAIL_RATE_LIMIT_WINDOW,
  AUTH_CONFIG.EMAIL_RATE_LIMIT_PREFIX
);

export const IpRateLimiter = rateLimiter(
  AUTH_CONFIG.IP_MAX_REQUESTS,
  AUTH_CONFIG.IP_RATE_LIMIT_WINDOW,
  AUTH_CONFIG.IP_RATE_LIMIT_PREFIX
);
