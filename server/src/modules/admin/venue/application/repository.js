import { pool } from '../../../../infrastructure/database/db.js';

export async function fetchApplications(status) {
  const statusFilter = status ?? null;
  const result = await pool.query(
    `
  SELECT * FROM (
  SELECT DISTINCT ON (va.venue_group_id)
    va.id, va.venue_group_id, va.name, va.category,
    va.district, va.state, va.status, va.cover_image_key, va.submitted_at, va.reviewed_at, va.rejection_reason,
    vp.id AS vendor_id, vp.vendor_name,
    a.id AS reviewer_id, a.email AS reviewer_email
  FROM venue_applications va
  JOIN vendor_profiles vp ON vp.id = va.vendor_id
  LEFT JOIN admins a ON a.id = va.reviewed_by
  ORDER BY va.venue_group_id, va.submitted_at DESC
  ) AS latest_per_group
  WHERE ($1::application_status IS NULL OR status = $1::application_status)
  ORDER BY submitted_at ASC`,
    [statusFilter]
  );
  return result.rows;
}

export async function fetchApplication(applicationId, status) {
  const result = await pool.query(
    `
  SELECT id, vendor_id, name, venue_details, category, address, district, state, pincode, geo_loc, images, proof_document_key, rejection_reason, submitted_at, reviewed_at
  FROM venue_applications
  WHERE id = $1
  ORDER BY submitted_at DESC
  LIMIT 1`,
    [applicationId]
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
