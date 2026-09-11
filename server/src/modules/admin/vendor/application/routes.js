import express from 'express';

import validateSchema from '../../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/vendor/applications',
  validateSchema(schema.status, 'query'),
  controller.getApplications
);

router.patch(
  '/vendor/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  validateSchema(schema.review, 'body'),
  controller.updateApplication
);

router.get('/vendor/applications/counts', controller.getApplicationsCount);

export default router;
