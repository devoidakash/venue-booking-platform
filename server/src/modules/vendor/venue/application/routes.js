import express from 'express';

import upload from '../../../../middleware/file.upload.js';
import validateSchema from '../../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import validateFileCount from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.post(
  '/venues/application',
  upload(7, 10).fields([
    { name: 'venueImages', maxCount: 5 },
    { name: 'proofDocument', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  validateSchema(schema),
  validateFileCount,
  controller.submitApplication
);

export default router;
