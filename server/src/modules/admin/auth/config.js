const isProd = process.env.NODE_ENV === 'production';

export const ADMIN_AUTH_CONFIG = {
  COOKIE_NAME: 'admin_sid',
  SESSION_PREFIX: 'admin:session:',
  SESSION_TTL: 30 * 24 * 60 * 60,

  get ADMIN_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: this.SESSION_TTL * 1000,
      path: '/api/admin',
    };
  },

  get ADMIN_CLEAR_COOKIE_OPTIONS() {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/admin',
    };
  },
};
