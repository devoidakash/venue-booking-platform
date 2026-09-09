import express from 'express';

import validateSchema from '../../../../middleware/schema.validation.js';
import {
  authenticateToken,
  ensureAccountActive,
} from '../../auth/middleware.js';
import * as controller from './controller.js';
import * as schema from './schems.js';

const router = express.Router();

router.get('/venues', controller.getVenues);

router.get(
  '/venues/:venueId',
  validateSchema(schema.venueId, 'params'),
  controller.getVenue
);

router.get(
  '/venues/:venueId/pricing',
  validateSchema(schema.venueId, 'params'),
  controller.getVenuePricing
);

router.use(authenticateToken, ensureAccountActive);

router.post(
  '/venues/:venueId/bookings',
  validateSchema(schema.venueId, 'params'),
  validateSchema(schema.createBooking),
  controller.createBooking
);

router.post(
  '/venues/bookings/:bookingId/payment',
  validateSchema(schema.bookingId, 'params'),
  controller.createPaymentOrder
);

router.post(
  '/bookings/:bookingId/payment/verify',
  validateSchema(schema.bookingId, 'params'),
  validateSchema(schema.verifyPayment),
  controller.verifyPayment
);

export default router;
