import { pool } from '../../../infrastructure/database/db.js';
import toCamelCase from '../../../utils/camelcase.conversion.js';

export async function fetchLatestApplicationStatus(userId) {
  const result = await pool.query(
    `SELECT status, rejection_reason
      FROM vendor_applications
      WHERE user_id = $1
      ORDER BY submitted_at 
      DESC LIMIT 1`,
    [userId]
  );
  return toCamelCase(result.rows[0]);
}

export async function insertVendorApplication(client, data) {
  const result = await client.query({
    text: `INSERT INTO vendor_applications
           (user_id, pan_name, phone, address, pincode, district, state, pan_number, pan_document_key)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           RETURNING id`,
    values: [
      data.userId,
      data.panName,
      data.phone,
      data.address,
      data.pincode,
      data.district,
      data.state,
      data.panNumber,
      data.documentKey,
    ],
  });

  return result.rows[0];
}
