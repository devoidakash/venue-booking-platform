const AUTH_CONFIG = {
  EMAIL_MAX_REQUESTS: 5,
  EMAIL_RATE_LIMIT_WINDOW: '10 m',
  EMAIL_RATE_LIMIT_PREFIX: 'otp:verify:ratelimit',

  IP_MAX_REQUESTS: 20,
  IP_RATE_LIMIT_WINDOW: '10 m',
  IP_RATE_LIMIT_PREFIX: 'otp:verify:ip:ratelimit',
};

export default AUTH_CONFIG;
