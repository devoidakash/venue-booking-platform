import { pool } from '../../../../infrastructure/database/db.js';

export async function getVenues() {
  const result = await pool.query(`
        SELECT v.id, v.vendor_id, v.name, v.category, v.district, v.state, v.booking_type, v.opening_time, v.closing_time, MIN(vp.price) AS starting_price 
        FROM venues v
        JOIN venue_pricing vp ON vp.venue_id = v.id
        WHERE v.status = 'live'
        GROUP BY v.id, v.vendor_id, v.name, v.category, v.district, v.state, v.booking_type, v.opening_time, v.closing_time
    `);
  return result.rows;
}

export async function getVenue(venueId) {
  const result = await pool.query(
    `
  SELECT
  v.id,
  v.vendor_id,
  v.name,
  v.description,
  v.category,
  v.district,
  v.state,
  v.booking_type,
  v.opening_time,
  v.closing_time,
  v.images,
  vp.starting_price

FROM venues v

JOIN (
  SELECT
    venue_id,
    MIN(price) AS starting_price
  FROM venue_pricing
  GROUP BY venue_id
) vp ON vp.venue_id = v.id

WHERE v.id = $1 AND v.status = 'live'`,
    [venueId]
  );
  return result.rows[0];
}

export async function getVenueBookingType(venueId) {
  const result = await pool.query(
    `
    SELECT booking_type FROM venues WHERE id = $1`,
    [venueId]
  );
  return result.rows[0]?.booking_type;
}

export async function getVenuePricing(venueId) {
  const result = await pool.query(
    `
  SELECT venue_id, day_type, duration_minutes, price FROM venue_pricing WHERE venue_id = $1`,
    [venueId]
  );
  return result.rows;
}

export async function getBookingPrice(data) {
  const result = await pool.query(
    `
  SELECT * FROM venue_pricing WHERE venue_id = $1 AND day_type = $2`,
    [data.venueId, data.dayType]
  );
  return result.rows[0]?.price ?? null;
}

export async function insertWholeDayBooking(data) {
  const result = await pool.query(
    `
  INSERT INTO bookings (user_id, venue_id, booking_date, booking_type, quantity, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.userId,
      data.venueId,
      data.booking_date,
      data.booking_type,
      data.quantity,
      data.total_amount,
    ]
  );
  return result.rows[0];
}

export async function getVenueTiming(venueId) {
  const result = await pool.query(
    `
    SELECT opening_time, closing_time FROM venues WHERE id = $1`,
    [venueId]
  );
  return result.rows[0] ?? null;
}

export async function insertTimeSlotBooking(data) {
  const result = await pool.query(
    `
  INSERT INTO bookings (user_id, venue_id, booking_date, booking_type, quantity, start_time, end_time, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.userId,
      data.venueId,
      data.booking_date,
      data.booking_type,
      data.quantity,
      data.start_time,
      data.end_time,
      data.total_amount,
    ]
  );
  return result.rows[0];
}

export async function getPaymentPrice(userId, bookingId) {
  const result = await pool.query(
    `
  SELECT id, total_amount FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'pending_payment'`,
    [bookingId, userId]
  );
  return result.rows[0];
}

export async function insertOrderId(data) {
  const result = await pool.query(
    `
  INSERT INTO payments (booking_id, gateway, gateway_order_id, amount
)
VALUES (
  $1, 'razorpay', $2, $3) RETURNING id `,
    [data.bookingId, data.orderId, data.totalAmount]
  );
  return result.rows[0]?.id;
}
