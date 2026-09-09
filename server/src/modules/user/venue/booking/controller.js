import * as service from '../booking/service.js';

export async function getVenues(req, res) {
  const data = await service.getVenues();
  res.status(200).json({
    success: true,
    message: 'Live venues fetched successfully',
    data,
  });
}

export async function getVenue(req, res) {
  const data = await service.getVenue(req.params.venueId);
  res.status(200).json({
    success: true,
    message: 'Venue details fetched successfully',
    data,
  });
}

export async function getVenuePricing(req, res) {
  const data = await service.getVenuePricing(req.params.venueId);
  res.status(200).json({
    success: true,
    message: 'Venue pricing details fetched successfully',
    data,
  });
}

export async function createBooking(req, res) {
  const data = await service.createBooking(
    req.user.id,
    req.params.venueId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data,
  });
}

export async function createPaymentOrder(req, res) {
  const data = await service.createPaymentOrder(
    req.user.id,
    req.params.bookingId
  );

  res.status(201).json({
    success: true,
    message: 'Payment order created successfully',
    data,
  });
}
