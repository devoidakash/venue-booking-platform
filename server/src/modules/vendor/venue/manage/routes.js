import express from 'express';

import upload from '../../../../middleware/file.upload.js';
import {
  requireFile,
  requireFiles,
  validateFileType,
} from '../../../../middleware/file.validation.js';
import validateSchema from '../../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import * as schema from './schema.js';

const router = express.Router();

router.get('/venues', controller.getVenues);

router.get(
  '/venues/applications/:applicationId',
  validateSchema(schema.applicationId, 'params'),
  controller.getVenuesApplication
);

router.get(
  '/venues/:venueId',
  validateSchema(schema.venueId, 'params'),
  controller.getVenueDetails
);

router.patch(
  '/venues/:venueId/cover',
  upload(1, 0).single('coverImage'),
  validateSchema(schema.venueId, 'params'),
  requireFile,
  validateFileType,
  controller.uploadCoverImage
);

router.patch(
  '/venues/:venueId/images',
  validateSchema(schema.venueId, 'params'),
  upload(10, 1).array('venueImages', 10),
  validateSchema(schema.deleteIds),
  validateFileType,
  controller.uploadVenueImages
);

router.patch(
  '/venues/:venueId/description',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.description),
  controller.updateVenueDescription
);

router.patch(
  '/venues/:venueId/operation-hours',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.hours),
  controller.updateVenueHours
);

router.patch(
  '/venues/:venueId/pricing',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.booking),
  controller.updateVenuePricing
);

router.patch(
  '/venues/:venueId/status',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.status),
  controller.updateVenueStatus
);

router.patch(
  '/venues/:venueId/reverification',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.reverification),
  controller.updateReverificationDetails
);

export default router;
