import express from 'express';

import validateSchema from '../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import { authenticateToken, ensureAccountActive } from './middleware.js';
import * as schema from './schema.js';

const router = express.Router();

router.post(
  '/auth/otp/request',
  validateSchema(schema.email),
  controller.requestOtp
);

router.post(
  '/auth/otp/verify',
  validateSchema(schema.credentials),
  controller.verifyOtp
);

router.get('/auth/google', controller.redirectToGoogleAuth);

router.get('/auth/google/callback', controller.loginWithGoogle);

router.get('/auth/me', authenticateToken, ensureAccountActive, controller.me);

router.post('/auth/refresh', controller.rotateSession);

router.post(
  '/auth/logout',
  authenticateToken,
  ensureAccountActive,
  controller.logout
);

export default router;
