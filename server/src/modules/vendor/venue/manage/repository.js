import { pool } from '../../../../infrastructure/database/db.js';

export async function featchVenues(vendorId) {
  const result = await pool.query(
    `
  SELECT id, name, category, district, state, status 
  FROM venues WHERE vendor_id = $1`,
    [vendorId]
  );
  return result.rows;
}

export async function fetchVenue(vendorId, venueId) {
  const result = await pool.query(
    `SELECT id, name, description, category, address, district, state, pincode, geo_loc, has_cover_image, images, booking_type, opening_time, closing_time, status, suspension_reason, created_at FROM venues WHERE id = $1 AND vendor_id = $2`,
    [venueId, vendorId]
  );
  return result.rows[0] ?? null;
}

export async function fetchReverificationApplication(venueId) {
  const result = await pool.query(
    `SELECT id, category, address, district, state, pincode, geo_loc,
            status, rejection_reason, submitted_at, reviewed_at
     FROM venue_reverifications
     WHERE venue_id = $1
       AND status IN ('pending', 'rejected')
     ORDER BY submitted_at DESC
     LIMIT 1`,
    [venueId]
  );

  return result.rows[0] ?? null;
}

export async function getCoverImage(vendorId, venueId) {
  const result = await pool.query(
    `
    SELECT has_cover_image
    FROM venues
    WHERE id = $1 AND vendor_id = $2
    `,
    [venueId, vendorId]
  );

  return result.rows[0] ?? null;
}

export async function updateCoverImage(vendorId, venueId) {
  await pool.query(
    `UPDATE venues  SET has_cover_image = TRUE WHERE id = $1 AND vendor_id = $2`,
    [venueId, vendorId]
  );
}

export async function getVenueImages(vendorId, venueId) {
  const result = await pool.query(
    `
  SELECT images FROM venues WHERE id = $1 AND vendor_id = $2 `,
    [venueId, vendorId]
  );
  return result.rows[0]?.images;
}

export async function updateVenueImages(data) {
  await pool.query(
    `UPDATE venues SET images = $1 WHERE id = $2 AND vendor_id = $3`,
    [data.finalFiles, data.venueId, data.vendorId]
  );
}

export async function fetchVenueDetails(client, vendorId, venueId) {
  const result = await client.query(
    `
  SELECT name, category, address, district, state, pincode, ST_Y(geo_loc::geometry) AS latitude,
  ST_X(geo_loc::geometry) AS longitude FROM venues WHERE id = $1 AND vendor_id = $2`,
    [venueId, vendorId]
  );
  return result.rows[0] ?? null;
}

export async function updateVenueDescription(vendorId, venueId, description) {
  const result = await pool.query(
    `
    UPDATE venues SET description = $1 WHERE id = $2 AND vendor_id = $3 RETURNING id`,
    [description, venueId, vendorId]
  );

  return result.rows[0]?.id ?? null;
}

export async function updateVenueTime(
  venueId,
  vendorId,
  openingTime,
  closingTime
) {
  const result = await pool.query(
    `
    UPDATE venues
    SET
    opening_time = $1,
    closing_time = $2,
    WHERE id = $3
    AND vendor_id = $4
    RETURNING id
    `,
    [openingTime, closingTime, venueId, vendorId]
  );

  return result.rows[0] ?? null;
}

export async function updateBookingType(client, data) {
  const result = await client.query(
    `
    UPDATE venues SET booking_type = $1 WHERE id = $2 AND vendor_id = $3 AND suspension_reason IS NULL RETURNING id`,
    [data.booking_type, data.venueId, data.vendorId]
  );
  return result.rows[0]?.id ?? null;
}

export async function deleteVenuePricing(client, venueId) {
  await client.query(
    `DELETE FROM venue_pricing WHERE venue_id = $1 RETURNING id`,
    [venueId]
  );
}

export async function insertWholeDayPricing(client, venueId, pricing) {
  for (const item of pricing) {
    await client.query(
      `
      INSERT INTO venue_pricing (
        venue_id,
        day_type,
        price
        )
        VALUES ($1, $2, $3)
        `,
      [venueId, item.day_type, item.price]
    );
  }
}

export async function insertTimeSlotPricing(client, venueId, pricing) {
  for (const item of pricing) {
    await client.query(
      `
        INSERT INTO venue_pricing (
          venue_id,
          day_type,
          duration_minutes,
          price
          )
          VALUES ($1, $2, $3, $4)
          `,
      [venueId, item.day_type, item.duration_minutes, item.price]
    );
  }
}

export async function updateVenueStatus(vendorId, venueId, status) {
  const result = await pool.query(
    `UPDATE venues SET status = $1 WHERE id = $1 AND vendorId = $2 RETURNING id`,
    [status, venueId, vendorId]
  );
  return result.rows[0]?.id ?? null;
}

export async function getVenuePricing(venueId) {
  const result = await pool.query(
    `
    SELECT * FROM venue_pricing WHERE venue_id = $1`,
    [venueId]
  );

  return result.rows;
}

export async function insertIntoVenueReverification(client, data) {
  const result = await client.query(
    `
        INSERT INTO venue_reverifications (
          venue_id,
          name,
          category,
          address,
          district,
          state,
          pincode,
          geo_loc
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          ST_SetSRID(ST_MakePoint($9, $8), 4326)::geography
        )
        RETURNING id, status
        `,
    [
      data.id,
      data.name,
      data.category,
      data.address,
      data.district,
      data.state,
      data.pincode,
      data.latitude,
      data.longitude,
    ]
  );

  return result.rows[0];
}

export async function fetchVenueApplications(vendorId) {
  const result = await pool.query(
    `
    SELECT *
    FROM (
      SELECT DISTINCT ON (venue_group_id)
        id, venue_group_id, name, venue_details, category, address, district, state, pincode,
        ST_Y(geo_loc::geometry) AS latitude,
        ST_X(geo_loc::geometry) AS longitude,
        images, status, proof_document_key, rejection_reason, submitted_at
      FROM venue_applications
      WHERE vendor_id = $1
      ORDER BY venue_group_id, submitted_at DESC
    ) AS latest_per_group
    WHERE status IN ('pending', 'rejected')
    `,
    [vendorId]
  );
  return result.rows;
}
