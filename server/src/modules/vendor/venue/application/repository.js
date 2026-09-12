import { pool } from '../../../../infrastructure/database/db.js';

export async function findVenueGroupId(vendorId, venueGroupId) {
  const result = await pool.query(
    `
  SELECT venue_group_id FROM venue_applications
  WHERE vendor_id = $1 AND venue_group_id = $2 AND status = 'rejected'`,
    [vendorId, venueGroupId]
  );
  return result.rows[0]?.venue_group_id ?? null;
}

export async function insertIntoVenueApplications(client, data) {
  const result = await client.query(
    `
      INSERT INTO venue_applications (
        vendor_id,
        venue_group_id,
        name,
        venue_details,
        category,
        address,
        district,
        state,
        pincode,
        geo_loc,
        images,
        proof_document_key
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        ST_SetSRID(ST_MakePoint($11, $10), 4326)::geography,
        $12,
        $13
      )
      RETURNING id
    `,
    [
      data.vendorId,
      data.venueGroupId,
      data.name,
      data.venueDetails,
      data.category,
      data.address,
      data.district,
      data.state,
      data.pincode,
      data.latitude,
      data.longitude,
      data.images,
      data.proofDocumentKey,
    ]
  );

  return result.rows[0];
}
