import express from 'express';

import upload from '../../../middleware/file.upload.js';
import {
  requireFile,
  validateFileType,
} from '../../../middleware/file.validation.js';
import validateSchema from '../../../middleware/schema.validation.js';
import { authenticateToken, ensureAccountActive } from '../auth/middleware.js';
import * as controller from './controller.js';
import { checkExistingApplication } from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/application/status',
  authenticateToken,
  ensureAccountActive,
  controller.getApplicationStatus
);

router.post(
  '/application',
  authenticateToken,
  ensureAccountActive,
  upload(1, 7).single('panDocument'),
  requireFile,
  validateFileType,
  validateSchema(schema),
  checkExistingApplication,
  controller.submitApplication
);

export default router;
