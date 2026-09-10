import express from 'express';

import validateSchema from '../../../../middleware/schema.validation.js';
import {
  listApplicationCount,
  listApplications,
  updateApplication,
} from './controller.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/vendor/applications',
  validateSchema(schema.status, 'query'),
  listApplications
);

router.patch(
  '/vendor/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  validateSchema(schema.review, 'body'),
  updateApplication
);

router.get('/vendor/applications/status-counts', listApplicationCount);

export default router;
