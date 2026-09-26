import { pool } from '../../../../../infrastructure/database/db.js';
import toCamelCase from '../../../../../utils/camelcase.conversion.js';
import { withTransaction } from '../../../../../utils/transaction.js';

export async function fetchPaymentByGatewayOrderId(orderId) {
  const result = await pool.query(
    `SELECT id, booking_id, status FROM payments WHERE gateway_order_id = $1`,
    [orderId]
  );
  return toCamelCase(result.rows[0]);
}

export async function markBookingAndPaymentFailed(paymentId, bookingId) {
  await withTransaction(pool, async (client) => {
    await client.query(`UPDATE payments SET status = 'failed' WHERE id = $1`, [
      paymentId,
    ]);
    await client.query(
      `UPDATE bookings SET status = 'payment_failed' WHERE id = $1 AND status = 'pending_payment'`,
      [bookingId]
    );
  });
}
