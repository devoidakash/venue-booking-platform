import googleClient from '../../../infrastructure/google/google.js';
import { AUTH_CONFIG } from './config.js';
import * as service from './service.js';

export async function requestOtp(req, res) {
  await service.requestOtp(req.body.email);
  return res.status(201).json({
    success: true,
    message: 'OTP sent successfully. Please check your email to continue.',
  });
}

export async function verifyOtp(req, res) {
  const data = await service.verifyOtp(req.body);

  res.cookie(
    AUTH_CONFIG.ACCESS_COOKIE,
    data.accessToken,
    AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    AUTH_CONFIG.REFRESH_COOKIE,
    data.refreshToken,
    AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json({ success: true, message: 'Login successful' });
}

export async function redirectToGoogleAuth(req, res) {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  res.redirect(googleAuthUrl);
}

export async function loginWithGoogle(req, res) {
  const { code } = req.query;
  const { tokens } = await googleClient.getToken(code);

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const data = await service.loginWithGoogle(payload);

  res.cookie(
    AUTH_CONFIG.ACCESS_COOKIE,
    data.accessToken,
    AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    AUTH_CONFIG.REFRESH_COOKIE,
    data.refreshToken,
    AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.redirect(process.env.FRONTEND_URL);
}

export async function me(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

export async function rotateSession(req, res) {
  const refreshToken = req.cookies[AUTH_CONFIG.REFRESH_COOKIE];

  const data = await service.rotateSession(refreshToken);

  res.cookie(
    AUTH_CONFIG.ACCESS_COOKIE,
    data.accessToken,
    AUTH_CONFIG.ACCESS_COOKIE_OPTIONS
  );

  res.cookie(
    AUTH_CONFIG.REFRESH_COOKIE,
    data.refreshToken,
    AUTH_CONFIG.REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json({ success: true, message: 'Login successful' });
}

export async function logout(req, res) {
  const refreshToken = req.cookies[AUTH_CONFIG.REFRESH_COOKIE];
  await service.logout(refreshToken);

  res.clearCookie(
    AUTH_CONFIG.ACCESS_COOKIE,
    AUTH_CONFIG.ACCESS_CLEAR_COOKIE_OPTIONS
  );

  res.clearCookie(
    AUTH_CONFIG.REFRESH_COOKIE,
    AUTH_CONFIG.REFRESH_CLEAR_COOKIE_OPTIONS
  );

  return res
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
}
