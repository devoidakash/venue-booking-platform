export async function findApplicationsByStatus(client, status) {
  const result = await client.query(
    `SELECT 
        id,
        pan_name, 
        phone, 
        address,
        pincode, 
        district, 
        state, 
        pan_number, 
        pan_document_key,
        status,
        submitted_at,
        rejection_reason,
        reviewed_at
      FROM vendor_applications
      WHERE status = $1
      ORDER BY submitted_at DESC`,
    [status]
  );
  return result.rows;
}

export async function markVendorAsApproved(client, data) {
  const result = await client.query(
    `UPDATE vendor_applications
     SET status = $1,
         reviewed_at = NOW(),
         reviewed_by = $2
     WHERE id = $3
       AND status = 'pending'
     RETURNING
       user_id,
       pan_name,
       phone,
       district,
       state`,
    [data.status, data.reviewedBy, data.applicationId]
  );

  return result.rows[0] ?? null;
}

export async function createVendorProfile(client, data) {
  await client.query(
    `INSERT INTO vendor_profiles(user_id, vendor_name, phone, district, state)
      VALUES ($1, $2, $3, $4, $5)`,
    [data.user_id, data.pan_name, data.phone, data.district, data.state]
  );
}

export async function markUserAsVendor(client, id) {
  await client.query(
    `
      UPDATE users 
      SET role = 'vendor'
      WHERE id = $1`,
    [id]
  );
}

export async function markVendorAsRejected(client, data) {
  const result = await client.query(
    `UPDATE vendor_applications
     SET status = 'rejected',
         rejection_reason = $1,
         reviewed_at = NOW(),
         reviewed_by = $2
     WHERE id = $3
       AND status = 'pending'
     RETURNING id`,
    [data.rejectionReason, data.reviewerId, data.applicationId]
  );

  return result.rows[0] ?? null;
}

export async function getStatusCount(client) {
  const result = await client.query(
    `SELECT 
    COUNT(*)  FILTER (WHERE status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved,
    COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
    FROM vendor_applications`,
  );

  return {
    pending: Number(result.rows[0].pending),
    approved: Number(result.rows[0].approved),
    rejected: Number(result.rows[0].rejected),
  };
}
