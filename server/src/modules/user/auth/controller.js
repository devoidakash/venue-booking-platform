import { USER_AUTH_CONFIG } from './config.js';
import {
  processLogout,
  processOtpRequest,
  processOtpVerification,
  rotateRefreshToken,
} from './service.js';

export async function handleMeRequest(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

export async function handleOtpRequest(req, res) {
  await processOtpRequest(req.body);
  return res.status(201).json({
    success: true,
    message: 'OTP sent successfully. Please check your email to continue.',
  });
}

export async function handleOtpVerification(req, res) {
  const { accessToken, refreshToken } = await processOtpVerification(req.body);

  res.cookie(
    USER_AUTH_CONFIG.ACCESS_COOKIE,
    accessToken,
    USER_AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    USER_AUTH_CONFIG.REFRESH_COOKIE,
    refreshToken,
    USER_AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json({ success: true, message: 'Login successful.' });
}

export async function handleSessionRotation(req, res) {
  const refreshToken = req.cookies[USER_AUTH_CONFIG.REFRESH_COOKIE];

  const newToken = await rotateRefreshToken(refreshToken);

  res.cookie(
    USER_AUTH_CONFIG.ACCESS_COOKIE,
    newToken.accessToken,
    USER_AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    USER_AUTH_CONFIG.REFRESH_COOKIE,
    newToken.refreshToken,
    USER_AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json({ success: true, message: 'Login successful' });
}

export async function handleLogout(req, res) {
  const refreshToken = req.cookies[USER_AUTH_CONFIG.REFRESH_COOKIE];
  await processLogout(refreshToken);

  res.clearCookie(
    USER_AUTH_CONFIG.ACCESS_COOKIE,
    USER_AUTH_CONFIG.ACCESS_CLEAR_COOKIE_OPTIONS
  );

  res.clearCookie(
    USER_AUTH_CONFIG.REFRESH_COOKIE,
    USER_AUTH_CONFIG.REFRESH_CLEAR_COOKIE_OPTIONS
  );

  return res
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
}
