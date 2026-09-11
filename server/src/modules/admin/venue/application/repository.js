import { rejects } from 'node:assert';

import { pool } from '../../../../infrastructure/database/db.js';

export async function fetchApplications(status) {
  const result = await pool.query(
    `
  SELECT id, vendor_id, name, venue_details, category, address, district, state, pincode, geo_loc, images, proof_document_key, rejection_reason, submitted_at
  FROM venue_applications
  WHERE status = $1
  ORDER BY submitted_at DESC`,
    [status]
  );
  return result.rows;
}

export async function markVenueAsRejected(reviewerId, applicationId, data) {
  const result = await pool.query(
    `UPDATE venue_applications SET status = 'rejected', rejection_reason = $1, reviewed_at = NOW(), reviewed_by = $2 WHERE id = $3 AND status = 'pending' RETURNING id`,
    [data.rejection_reason, reviewerId, applicationId]
  );
  return result.rows[0] ?? null;
}

export async function markVenueAsApproved(client, reviewerId, applicationId) {
  const result = await client.query(
    `UPDATE venue_applications 
    SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1
    WHERE id = $2 AND status = 'pending' 
    RETURNING id, vendor_id, name, category, address, district, state, pincode, geo_loc`,
    [reviewerId, applicationId]
  );
  return result.rows[0] ?? null;
}

export async function createVenue(client, data) {
  const result = await client.query(
    `INSERT INTO venues(vendor_id, application_id, name, category, address, district, state, pincode, geo_loc)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      data.vendor_id,
      data.id,
      data.name,
      data.category,
      data.address,
      data.district,
      data.state,
      data.pincode,
      data.geo_loc,
    ]
  );
  return result.rows[0];
}

export async function fetchApplicationsCounts() {
  const result = await pool.query(`
  SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
  FROM venue_applications`);
  return {
    pending: Number(result.rows[0].pending),
    approved: Number(result.rows[0].approved),
    rejected: Number(result.rows[0].rejected),
  };
}
