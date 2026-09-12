export async function findVendorProfileByUserId(client, id) {
  const result = await client.query(
    `
    SELECT
      vp.vendor_name,
      vp.phone,
      vp.district,
      vp.state,
      vp.is_suspended,
      vp.suspension_reason,
      vp.approved_at,
      va.pan_document_key
    FROM vendor_profiles vp
    LEFT JOIN vendor_applications va
      ON va.user_id = vp.user_id
    WHERE va.status = 'approved'
      AND vp.user_id = $1;
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
