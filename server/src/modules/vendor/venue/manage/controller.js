import * as service from './service.js';

export async function getVenues(req, res) {
  const data = await service.getVenues(req.vendor.id);
  res.status(200).json({
    success: true,
    data,
  });
}

export async function getVenueDetails(req, res) {
  const data = await service.getVenueDetails(req.vendor.id, req.params.venueId);
  res.status(200).json({
    success: true,
    data: data,
  });
}

export async function uploadCoverImage(req, res) {
  await service.uploadCoverImage(req.vendor.id, req.params.venueId, req.file);
  res
    .status(200)
    .json({ success: true, message: 'Cover image uploaded sucessfully' });
}

export async function uploadVenueImages(req, res) {
  const data = {
    vendorId: req.vendor.id,
    venueId: req.params.venueId,
    ...req.body,
    files: req.files,
  };
  await service.uploadVenueImages(data);
  res
    .status(200)
    .json({ success: true, message: 'Venue images updated sucessfully' });
}

export async function updateVenueDescription(req, res) {
  await service.updateVenueDescription(
    req.vendor.id,
    req.params.venueId,
    req.body.description
  );

  res.status(200).json({
    success: true,
    message: 'Venue description updated successfully',
  });
}

export async function updateVenueHours(req, res) {
  await service.updateVenueHours(req.vendor.id, req.params.venueId, req.body);

  res.status(200).json({
    success: true,
    message: 'Venue hours updated successfully',
  });
}

export async function updateVenuePricing(req, res) {
  await service.updateVenuePricing(req.vendor.id, req.params.venueId, req.body);
  res.status(200).json({
    success: true,
    message: 'Venue pricing updated successfully',
  });
}

export async function updateVenueStatus(req, res) {
  await service.updateVenueStatus(
    req.vendor.id,
    req.params.venueId,
    req.body.status
  );
  res.status(200).json({
    success: true,
    message: 'Venue status updated successfully',
  });
}

export async function updateReverificationDetails(req, res) {
  const data = await service.updateReverificationDetails(
    req.vendor.id,
    req.params.venueId,
    req.body
  );
  res.status(201).json({
    success: true,
    message: 'Venue changes submitted for re-verification',
    data,
  });
}
