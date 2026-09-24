import { pool } from '../../../../../infrastructure/database/db.js';
import { withTransaction } from '../../../../../utils/transaction.js';
import { sendBookingConfirmationEmail } from '../../../email.service.js';
import {
  confirmBookingIgnoringExpiry,
  fetchVenueNameAndAddress,
  markPaymentPaid,
} from '../repository.js';
import * as repository from './repository.js';

export async function handlePaymentCaptured(paymentEntity) {
  const payment = await repository.getPaymentByGatewayOrderId(
    paymentEntity.order_id
  );

  if (!payment) {
    console.error('Webhook for unknown order:', paymentEntity.order_id);
    return;
  }

  if (payment.status !== 'pending') {
    return;
  }

  const bookingData = await withTransaction(pool, async (client) => {
    await markPaymentPaid(client, payment.id, paymentEntity.id);
    return await confirmBookingIgnoringExpiry(client, payment.bookingId);
  });

  const venue = await fetchVenueNameAndAddress(bookingData.venueId);
  try {
    await sendBookingConfirmationEmail({ bookingData, venue });
  } catch (err) {
    console.error('Confirmation email failed:', err);
  }
}

export async function handlePaymentFailed(paymentEntity) {
  const payment = await repository.getPaymentByGatewayOrderId(
    paymentEntity.order_id
  );
  if (!payment || payment.status !== 'pending') return;

  await repository.markPaymentFailedAndBooking(payment.id, payment.bookingId);
}
