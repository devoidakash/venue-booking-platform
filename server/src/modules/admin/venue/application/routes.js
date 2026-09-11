import express from 'express';

import validateSchema from '../../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/venue/applications',
  validateSchema(schema.status, 'query'),
  controller.getApplications
);

router.patch(
  '/venue/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  validateSchema(schema.review, 'body'),
  controller.updateApplication
);

router.get('/venue/applications/count', controller.getApplicationsCounts);

export default router;
