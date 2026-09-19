import express from 'express';

import validateSchema from '../../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import * as schema from './schema.js';

const router = express.Router();

router.get('/venue/applications/counts', controller.getApplicationsCounts);

router.get(
  '/venue/applications',
  validateSchema(schema.status, 'query'),
  controller.getApplications
);

router.get(
  '/venue/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  controller.getApplication
);

router.patch(
  '/venue/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  validateSchema(schema.review, 'body'),
  controller.reviewApplication
);

export default router;
