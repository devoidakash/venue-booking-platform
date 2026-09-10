import express from 'express';

import upload from '../../../middleware/file.upload.js';
import {
  requireFile,
  validateFileType,
} from '../../../middleware/file.validation.js';
import validateSchema from '../../../middleware/schema.validation.js';
import { authenticateToken, ensureAccountActive } from '../auth/middleware.js';
import { handleApplicationStatus, submitApplication } from './controller.js';
import { checkExistingApplication } from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/application/status',
  authenticateToken,
  ensureAccountActive,
  handleApplicationStatus
);

router.post(
  '/application',
  authenticateToken,
  ensureAccountActive,
  upload(1, 8).single('panDocument'),
  requireFile,
  validateFileType,
  validateSchema(schema),
  checkExistingApplication,
  submitApplication
);

export default router;
