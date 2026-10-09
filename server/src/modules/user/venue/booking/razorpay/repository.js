import pool from '../../../../../infrastructure/database/db.js';
import toCamelCase from '../../../../../utils/camelcase.conversion.js';
import { withTransaction } from '../../../../../utils/transaction.js';

export async function findBookingIdByOrderId(orderId) {
  const result = await pool.query(
    `SELECT booking_id
    FROM payments
    WHERE gateway_order_id = $1`,
    [orderId]
  );
  return toCamelCase(result.rows[0]);
}

export async function getBookingStatus(client, bookingId) {
  const result = await client.query(
    `
    SELECT id, user_id, status
    FROM bookings
    WHERE id = $1
    FOR UPDATE
    `,
    [bookingId]
  );
  return toCamelCase(result.rows[0]);
}

export async function getPaymentStatus(client, bookingId, orderId) {
  const result = await client.query(
    `
    SELECT id, gateway_order_id, status
    FROM payments
    WHERE booking_id = $1
      AND gateway_order_id = $2
    FOR UPDATE
    `,
    [bookingId, orderId]
  );
  return toCamelCase(result.rows[0]);
}
