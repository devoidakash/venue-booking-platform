const isProd = process.env.NODE_ENV === 'production';

export const USER_AUTH_CONFIG = {
  OTP_PREFIX: 'user:otp:',
  OTP_RATE_LIMIT_PREFIX: 'user:otp:rate:',
  OTP_COOLDOWN_PREFIX: 'user:otp:cooldown:',

  OTP_TTL: 600,
  OTP_COOLDOWN_TTL: 60,
  OTP_RATE_LIMIT_TTL: 600,
  OTP_MAX_REQUESTS: 5,

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
