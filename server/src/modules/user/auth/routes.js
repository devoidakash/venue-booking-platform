import express from 'express';

import validateSchema from '../../../middleware/schema.validation.js';
import {
  handleGoogleCallback,
  handleGoogleRedirect,
  handleLogout,
  handleMeRequest,
  handleOtpRequest,
  handleOtpVerification,
  handleSessionRotation,
} from './controller.js';
import { authenticateToken, ensureAccountActive } from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.post(
  '/auth/otp/request',
  validateSchema(schema.email),
  handleOtpRequest
);

router.post(
  '/auth/otp/verify',
  validateSchema(schema.verify),
  handleOtpVerification
);

router.get('/auth/google', handleGoogleRedirect);

router.get('/auth/google/callback', handleGoogleCallback);

router.get('/auth/me', authenticateToken, ensureAccountActive, handleMeRequest);

router.post('/auth/refresh', handleSessionRotation);

router.post(
  '/auth/logout',
  authenticateToken,
  ensureAccountActive,
  handleLogout
);

export default router;
