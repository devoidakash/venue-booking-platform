import { pool } from '../../../../infrastructure/database/db.js';
import ApiError from '../../../../utils/api.error.js';
import { getFromCloudinary } from '../../../../utils/cloudinary.storage.js';
import { getPrivateUrl } from '../../../../utils/r2.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import ERROR_CONFIG from './error.config.js';
import * as repository from './repository.js';

export async function getVenues(vendorId) {
  const venues = await repository.featchVenues(vendorId);
  return Promise.all(
    venues.map(async (venue) => {
      const coverImageId = `venues/${vendorId}/${venue.id}/cover_image`;
      return {
        id: venue.id,
        name: venue.name,
        category: venue.category,
        district: venue.district,
        state: venue.state,
        coverImageUrl: (await getFromCloudinary([coverImageId]))[0],
        status: venue.status,
      };
    })
  );
}

export async function getVenueDetails(venueId, vendorId) {
  const venue = await repository.fetchVenue(venueId, vendorId);

  if (!venue) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }

  const reverification =
    await repository.fetchReverificationApplication(venueId);

  return { venue, reverification };
}

export async function uploadCoverImage(vendorId, venueId, file) {
  try {
    const venue = await repository.getCoverImage(vendorId, venueId);

    if (!venue) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }

    const coverImageId = `venues/${vendorId}/${venueId}/cover_image`;
    await uploadToCloudinary(file.buffer, coverImageId);

    if (!venue.has_cover_image) {
      return await repository.updateCoverImage(vendorId, venueId);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;

    throw new ApiError(ERROR_CONFIG.FILE_UPLOAD_FAILED);
  }
}

export async function uploadVenueImages({
  vendorId,
  venueId,
  deleteIds,
  files,
}) {
  try {
    const dbImages = await repository.getVenueImages(vendorId, venueId);

    if (!dbImages) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }

    const deleteFiles = deleteIds.map(
      (id) => `venues/${vendorId}/${venueId}/venue_image-${id}`
    );

    const invalidDeleteFiles = deleteFiles.filter(
      (file) => !dbImages.includes(file)
    );

    if (invalidDeleteFiles.length > 0) {
      throw new ApiError(ERROR_CONFIG.INVALID_IMAGE_ID);
    }

    const finalCount = dbImages.length + files.length - deleteFiles.length;

    if (finalCount > 10) {
      throw new ApiError(ERROR_CONFIG.FILE_UPLOAD_LIMIT_EXCEEDED);
    }

    for (const file of deleteFiles) {
      await deleteFromCloudinary(file);
    }

    const uploadFiles = [];

    for (const file of files) {
      const path = `venues/${vendorId}/${venueId}/venue_image-${crypto.randomUUID()}`;

      await uploadToCloudinary(file.buffer, path);

      uploadFiles.push(path);
    }

    const finalFiles = [
      ...dbImages.filter((image) => !deleteFiles.includes(image)),
      ...uploadFiles,
    ];

    return await repository.updateVenueImages({
      vendorId,
      venueId,
      finalFiles,
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(ERROR_CONFIG.FILE_UPLOAD_FAILED);
  }
}

export async function updateVenueDescription(vendorId, venueId, description) {
  const id = await repository.updateVenueDescription(
    vendorId,
    venueId,
    description
  );

  if (!id) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }
  return;
}

export async function updateVenueHours(
  vendorId,
  venueId,
  { opening_time, closing_time }
) {
  const venue = await repository.updateVenueTime(
    venueId,
    vendorId,
    opening_time,
    closing_time
  );

  if (!venue) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }

  return venue;
}

export async function updateVenuePricing(vendorId, venueId, data) {
  return withTransaction(pool, async (client) => {
    const venue = await repository.updateBookingType(client, {
      vendorId,
      venueId,
      bookingType: data.booking_type,
    });

    if (!venue) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }

    await repository.deleteVenuePricing(client, venueId);

    if (data.booking_type === 'whole_day') {
      await repository.insertWholeDayPricing(client, venueId, data.pricing);
    } else {
      await repository.insertTimeSlotPricing(client, venueId, data.pricing);
    }
  });
}

export async function updateVenueStatus(vendorId, venueId, status) {
  if (status == 'draft') {
    const id = await repository.updateVenueStatus(vendorId, venueId);
    if (!id) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }
    return;
  }
  const errors = [];
  const venue = await repository.fetchVenue(vendorId, venueId);
  if (!venue) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }

  if (!venue.description) {
    errors.push({
      field: 'description',
      message: 'Venue description is required',
    });
  }

  if (!venue.has_cover_image) {
    errors.push({
      field: 'cover_image',
      message: 'Cover image is required',
    });
  }

  if (!venue.images?.length) {
    errors.push({
      field: 'images',
      message: 'At least one venue image is required',
    });
  }

  if (!venue.booking_type) {
    errors.push({
      field: 'booking_type',
      message: 'Booking type is required',
    });
  }

  if (!venue.opening_time || !venue.closing_time) {
    errors.push({
      field: 'opening_time & closing_time',
      message: 'Opening and closing time is required',
    });
  }

  if (venue.status === 'suspended') {
    errors.push({
      field: 'status',
      message: 'Suspended venue cannot be made live',
    });
  }

  const pricing = await repository.getVenuePricing(venueId);
  if (venue.booking_type === 'whole_day') {
    const dayTypes = new Set(pricing.map((item) => item.day_type));

    if (!dayTypes.has('weekday')) {
      errors.push({
        field: 'pricing.weekday',
        message: 'Weekday pricing is required',
      });
    }

    if (!dayTypes.has('weekend')) {
      errors.push({
        field: 'pricing.weekend',
        message: 'Weekend pricing is required',
      });
    }
  }
  if (venue.booking_type == 'time_slot') {
    for (const price of pricing) {
      if (!price.duration_minutes) {
        errors.push({
          field: 'duration_minutes',
          message: 'Duration minutes is required for everyday',
        });
      }
    }
  }

  if (errors.length) {
    throw new ApiError(ERROR_CONFIG.INCOMPLETE_VENUE_DETAILS, errors);
  }

  return repository.updateVenueStatus(vendorId, venueId, status);
}

export async function updateReverificationDetails(vendorId, venueId, data) {
  return withTransaction(pool, async (client) => {
    const venue = await repository.fetchVenueDetails(client, vendorId, venueId);
    if (!venue) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }
    try {
      return await repository.insertIntoVenueReverification(client, {
        ...venue,
        ...data,
      });
    } catch (err) {
      if (
        err.code === '23505' &&
        err.constraint === 'unique_pending_venue_reverification'
      ) {
        throw new ApiError(ERROR_CONFIG.REVERIFICATION_ALREADY_PENDING);
      }

      throw err;
    }
  });
}

export async function getVenuesApplications(vendorId) {
  const venues = await repository.fetchVenueApplications(vendorId);
  return Promise.all(
    venues.map(async (venue) => {
      return {
        id: venue.id,
        name: venue.name,
        venueDetails: venue.venue_details,
        category: venue.category,
        address: venue.address,
        district: venue.district,
        state: venue.state,
        pincode: venue.pincode,
        latitude: venue.latitude,
        longitude: venue.longitude,
        status: venue.status,
        rejectionReason: venue.rejection_reason,
        submittedAt: venue.submitted_at,
        images: await getPrivateUrl(venue.images),
        proofDocumentUrl: (await getPrivateUrl([venue.proof_document_key]))[0],
      };
    })
  );
}
