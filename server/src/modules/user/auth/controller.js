import googleClient from '../../../infrastructure/google/google.js';
import { USER_AUTH_CONFIG } from './config.js';
import {
  processGoogleLogin,
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

export async function handleGoogleRedirect(req, res) {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  res.redirect(googleAuthUrl);
}

export async function handleGoogleCallback(req, res) {
  const { code } = req.query;
  const { tokens } = await googleClient.getToken(code);

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const data = await processGoogleLogin(payload);

  res.cookie(
    USER_AUTH_CONFIG.ACCESS_COOKIE,
    data.accessToken,
    USER_AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    USER_AUTH_CONFIG.REFRESH_COOKIE,
    data.refreshToken,
    USER_AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.redirect(process.env.FRONTEND_URL);
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
