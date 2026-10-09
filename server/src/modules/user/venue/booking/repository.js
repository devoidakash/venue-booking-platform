import pool from '../../../../infrastructure/database/db.js';
import toCamelCase from '../../../../utils/camelcase.conversion.js';
import { bookingId } from './schems.js';

export async function getVenues() {
  const result = await pool.query(`
        SELECT v.id, v.vendor_id, v.name, v.category, v.district, v.state, v.booking_type, v.opening_time, v.closing_time, MIN(vp.price) AS starting_price 
        FROM venues v
        JOIN venue_pricing vp ON vp.venue_id = v.id
        WHERE v.status = 'live'
        GROUP BY v.id, v.vendor_id, v.name, v.category, v.district, v.state, v.booking_type, v.opening_time, v.closing_time
    `);
  return result.rows.map((row) => toCamelCase(row));
}

export async function getVenue(venueId) {
  const result = await pool.query(
    `
    SELECT
      v.id, v.name, v.description, v.category,
      v.district, v.state, v.pincode,
      ST_Y(v.geo_loc::geometry) AS latitude,
      ST_X(v.geo_loc::geometry) AS longitude,
      v.booking_type, v.opening_time, v.closing_time, v.images,
      (SELECT MIN(price) FROM venue_pricing WHERE venue_id = v.id) AS starting_price
    FROM venues v
    WHERE v.id = $1 AND v.status = 'live'
    `,
    [venueId]
  );

  return toCamelCase(result.rows[0]);
}

export async function getVenuePricing(venueId) {
  const { rows } = await pool.query(
    `
    SELECT v.id, v.opening_time, v.closing_time, v.booking_type,
    COALESCE(
    json_agg(
    json_build_object(
    'dayType', vp.day_type,
    'durationMinutes', vp.duration_minutes,
    'price', vp.price)
    ), '[]'
    ) AS pricing 
    FROM venues v 
    JOIN venue_pricing vp 
    On v.id = vp.venue_id
    WHERE v.id = $1
    AND status = 'live'
    GROUP BY v.id
    `,
    [venueId]
  );
  return toCamelCase(rows[0]);
}

export async function getVenueAvailability(client, venueId, data) {
  const result = await client.query(
    `WITH venue AS (
  SELECT id, capacity
  FROM venues
  WHERE id = $1
  FOR UPDATE
)
SELECT
  v.capacity,
  COALESCE((
    SELECT SUM(b.quantity)
    FROM bookings b
    WHERE b.venue_id = v.id
      AND b.booking_date = $2
      AND b.booking_type = $3
      AND b.status IN ('pending_payment', 'confirmed')
      AND (
        $3 = 'whole_day'
        OR (
          $3 = 'time_slot'
          AND b.start_time = $4
          AND b.end_time = $5
        )
      )
  ), 0) AS booked
FROM venue v;`,
    [venueId, data.bookingDate, data.bookingType, data.startTime, data.endTime]
  );

  return toCamelCase(result.rows[0]);
}

export async function getVenuePricingByFilter(
  client,
  venueId,
  bookingType,
  dayType
) {
  const result = await client.query(
    `
    SELECT v.opening_time, v.closing_time, vp.price  
    FROM venues v 
    JOIN venue_pricing vp 
    On v.id = vp.venue_id
    WHERE v.id = $1
    AND v.status = 'live'
    AND v.booking_type = $2
    AND vp.day_type = $3 
    `,
    [venueId, bookingType, dayType]
  );
  return toCamelCase(result.rows[0]);
}

export async function insertIntoBookings(client, userId, venueId, data) {
  const result = await client.query(
    `
  INSERT INTO bookings (user_id, venue_id, booking_date, booking_type,quantity, start_time, end_time, total_amount)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING
  id,
  booking_date,
  booking_type,
  quantity,
  start_time,
  end_time,
  total_amount,
  status`,
    [
      userId,
      venueId,
      data.bookingDate,
      data.bookingType,
      data.quantity,
      data.startTime ?? null,
      data.endTime ?? null,
      data.totalAmount,
    ]
  );
  return result.rows[0];
}

// createPaymentOrder function

export async function findBooking(client, userId, bookingId) {
  const result = await client.query(
    `
  SELECT id, total_amount 
  FROM bookings
  WHERE id = $1
  AND user_id = $2
  AND status = 'pending_payment'
  FOR UPDATE`,
    [bookingId, userId]
  );
  return toCamelCase(result.rows[0]);
}

export async function findExistingOrder(client, bookingId) {
  const result = await client.query(
    `
    SELECT id, gateway_order_id, amount
    FROM payments
    WHERE booking_id = $1
    AND status = 'pending'
    `,
    [bookingId]
  );
  return toCamelCase(result.rows[0]);
}

export async function insertIntoPayments(client, data) {
  const result = await client.query(
    `
  INSERT INTO payments
  (booking_id, gateway, gateway_order_id, amount)
  VALUES ($1, 'razorpay', $2, $3) 
  RETURNING id `,
    [data.bookingId, data.orderId, data.totalAmount]
  );
  return result.rows[0];
}

// verifyPaymnet functions
export async function getBookingStatus(client, bookingId, userId) {
  const result = await client.query(
    `
    SELECT id, status
    FROM bookings
    WHERE id = $1
      AND user_id = $2
    FOR UPDATE
    `,
    [bookingId, userId]
  );
  return toCamelCase(result.rows[0]);
}

export async function getPaymentStatus(client, bookingId) {
  const result = await client.query(
    `
    SELECT id, gateway_order_id, status
    FROM payments
    WHERE booking_id = $1
    FOR UPDATE
    `,
    [bookingId]
  );
  return toCamelCase(result.rows[0]);
}

export async function fetchBookingDetails(client, bookingId, userId) {
  const result = await client.query(
    `
    SELECT
      b.id as booking_id,
      b.venue_id,
      u.email AS user_email,
      v.name AS venue_name,
      CONCAT_WS(', ', v.address, v.district, v.state, v.pincode) AS venue_address,
      b.booking_date,
      b.booking_type,
      b.quantity,
      b.start_time,
      b.end_time,
      b.total_amount,
      b.status AS booking_status,
      p.id as payment_id,
      p.gateway_order_id,
      p.gateway_payment_id,
      p.status AS payment_status
    FROM bookings b
    JOIN payments p
    ON p.booking_id = b.id
    JOIN users u ON u.id = b.user_id
    JOIN venues v ON v.id = b.venue_id
    WHERE b.id = $1
    AND b.user_id = $2
    `,
    [bookingId, userId]
  );
  return toCamelCase(result.rows[0]);
}

export async function confirmBookingAndPayment(
  client,
  paymentId,
  gatewayPaymentId
) {
  await client.query(
    `
    WITH updated_payment AS (
      UPDATE payments
      SET gateway_payment_id = $1,
          status = 'paid'
      WHERE id = $2
        AND status = 'pending'
      RETURNING booking_id
    )
    UPDATE bookings
    SET status = 'confirmed'
    WHERE id = (SELECT booking_id FROM updated_payment)
      AND status = 'pending_payment'
    `,
    [gatewayPaymentId, paymentId]
  );
}

export async function markRefundPending(
  client,
  paymentId,
  paymentIdFromGateway
) {
  await client.query(
    `
    UPDATE payments
    SET
      gateway_payment_id = $1,
      status = 'refund_pending'
    WHERE id = $2
      AND status = 'expired'
    `,
    [paymentIdFromGateway, paymentId]
  );
}

export async function fetchBookingsHistory(userId) {
  const result = await pool.query(
    `
    SELECT 
      b.id AS booking_id,
      b.venue_id,
      v.name AS venue_name,
      v.category AS venue_category,
      b.booking_date,
      b.booking_type,
      b.quantity,
      b.start_time,
      b.end_time,
      b.total_amount,
      b.status AS booking_status
    FROM bookings b
    JOIN venues v ON v.id = b.venue_id
    WHERE b.user_id = $1
    ORDER BY b.booking_date DESC, b.created_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => toCamelCase(row));
}

export async function fetchVenueNameAndAddress(venueId) {
  const result = await pool.query(
    `
    SELECT name, address FROM venues WHERE id = $1
    `,
    [venueId]
  );

  return toCamelCase(result.rows[0]);
}

export async function expireStaleBookings() {
  const result = await pool.query(`
    UPDATE bookings
    SET status = 'expired'
    WHERE status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '10 minutes'
  `);
  return result.rowCount;
}
