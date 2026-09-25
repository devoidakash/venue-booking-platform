const isProd = process.env.NODE_ENV === 'production';

export const AUTH_CONFIG = {
  OTP_PREFIX: 'otp:',
  OTP_TTL: 600,

  OTP_COOLDOWN_PREFIX: 'otp:cooldown',
  OTP_COOLDOWN_TTL: 60,

  OTP_RATE_LIMIT_MAX_REQUESTS: 5,
  OTP_RATE_LIMIT_WINDOW: '10 m',
  OTP_RATE_LIMIT_PREFIX: 'otp:ratelimit',

  OTP_VERIFY_EMAIL_MAX_REQUESTS: 5,
  OTP_VERIFY_EMAIL_RATE_LIMIT_WINDOW: '10 m',
  OTP_VERIFY_EMAIL_RATE_LIMIT_PREFIX: 'otp:verify:ratelimit',

  OTP_VERIFY_IP_MAX_REQUESTS: 20,
  OTP_VERIFY_IP_RATE_LIMIT_WINDOW: '10 m',
  OTP_VERIFY_IP_RATE_LIMIT_PREFIX: 'otp:verify:ip:ratelimit',

  ACCESS_COOKIE: 'user_sid',
  REFRESH_COOKIE: 'user_rid',
  ACCESS_MAX_AGE: 15 * 60 * 1000,
  REFRESH_MAX_AGE: 30 * 24 * 60 * 60 * 1000,

  get ACCESS_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: this.ACCESS_MAX_AGE,
    };
  },

  get REFRESH_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: this.REFRESH_MAX_AGE,
    };
  },

  get ACCESS_CLEAR_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };
  },

  get REFRESH_CLEAR_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };
  },
};
