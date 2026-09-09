export const ERROR_CONFIG = {
  VENUE_PRICING_NOT_FOUND: {
    statusCode: 404,
    message: 'Venue pricing not found',
    code: 'VENUE_PRICING_NOT_FOUND',
  },
  VENUE_NOT_FOUND: {
    statusCode: 404,
    message: 'Venue not found',
    code: 'VENUE_NOT_FOUND',
  },
  VENUE_BOOKING_FAILED: {
    statusCode: 400,
    message: 'Venue booking failed. Please try again',
    code: 'VENUE_BOOKING_FAILED',
  },
  VENUE_BOOKING_TIME_INVALID: {
    statusCode: 400,
    message: 'Selected time is outside venue operating hours',
    code: 'VENUE_BOOKING_TIME_INVALID',
  },
  VENUE_BOOKING_NOT_FOUND: {
    statusCode: 400,
    message: 'Booking not found. Please book the venue again',
    code: 'VENUE_BOOKING_NOT_FOUND',
  },
  BOOKING_ORDER_CREATION_FAILED: {
    statusCode: 400,
    message: 'Unable to create payment order',
    code: 'BOOKING_ORDER_CREATION_FAILED',
  },
  PAYMENT_VERIFICATION_FAILED: {
    statusCode: 400,
    message: 'Payment verification failed',
    code: 'PAYMENT_VERIFICATION_FAILED',
  },

  PAYMENT_NOT_CAPTURED: {
    statusCode: 400,
    message: 'Payment was not captured',
    code: 'PAYMENT_NOT_CAPTURED',
  },
};
