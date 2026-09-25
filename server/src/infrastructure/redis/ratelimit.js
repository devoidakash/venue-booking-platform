import { Ratelimit } from '@upstash/ratelimit';

import { AUTH_CONFIG } from '../../modules/user/auth/config.js';
import { redis } from './redis.js';

export const otpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    AUTH_CONFIG.OTP_RATE_LIMIT_MAX_REQUESTS,
    AUTH_CONFIG.OTP_RATE_LIMIT_WINDOW
  ),
  prefix: AUTH_CONFIG.OTP_RATE_LIMIT_PREFIX,
});
