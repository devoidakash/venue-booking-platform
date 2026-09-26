import crypto from 'crypto';

import googleClient from '../../../infrastructure/google/google.js';
import { USER_AUTH_CONFIG } from './config.js';
import * as service from './service.js';

export async function requestOtp(req, res) {
  await service.requestOtp(req.body.email);
  return res.status(201).json({
    success: true,
    message: 'OTP sent successfully. Please check your email to continue.',
  });
}

export async function verifyOtp(req, res) {
  const data = await service.verifyOtp(req.body, req.ip);

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

  return res.status(200).json({ success: true, message: 'Login successful' });
}

export async function redirectToGoogleAuth(req, res) {
  const state = crypto.randomBytes(16).toString('hex');

  res.cookie(
    USER_AUTH_CONFIG.STATE_COOKIE,
    state,
    USER_AUTH_CONFIG.STATE_COOKIE_OPTIONS
  );

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=openid%20email` +
    `&state=${state}`;

  res.redirect(googleAuthUrl);
}

export async function loginWithGoogle(req, res) {
  const { code, state, error } = req.query;
  const savedState = req.cookies[USER_AUTH_CONFIG.STATE_COOKIE];

  if (error || !code || !state || state !== savedState) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    );
  }

  res.clearCookie(
    USER_AUTH_CONFIG.STATE_COOKIE,
    USER_AUTH_CONFIG.STATE_COOKIE_CLEAR_OPTIONS
  );

  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=email_not_verified`
    );
  }

  const data = await service.loginWithGoogle(payload);

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

export async function me(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

export async function rotateSession(req, res) {
  const refreshToken = req.cookies[USER_AUTH_CONFIG.REFRESH_COOKIE];

  const data = await service.rotateSession(refreshToken);

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

  return res.status(200).json({ success: true, message: 'Login successful' });
}

export async function logout(req, res) {
  const refreshToken = req.cookies[USER_AUTH_CONFIG.REFRESH_COOKIE];
  await service.logout(refreshToken);

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
