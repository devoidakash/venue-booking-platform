export async function findLatestApplicationByUserId(client, userId) {
  const result = await client.query(
    `SELECT status, rejection_reason
      FROM vendor_applications
      WHERE user_id = $1
      ORDER BY submitted_at 
      DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function findLatestApplicationStatusByUserId(client, userId) {
  const result = await client.query(
    `SELECT status
    FROM vendor_applications
    WHERE user_id = $1
    ORDER BY submitted_at 
    DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.status ?? null;
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

  return result.rows[0].id;
}
