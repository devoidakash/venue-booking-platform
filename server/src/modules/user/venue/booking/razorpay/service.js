import pool from '../../../../../infrastructure/database/db.js';
import { withTransaction } from '../../../../../utils/transaction.js';
import {
  sendBookingConfirmationEmail,
  sendRefundStartedEmail,
} from '../../../email.service.js';
import {
  confirmBookingAndPayment,
  fetchBookingDetails,
  markRefundPending,
} from '../repository.js';
import * as repository from './repository.js';

export async function paymentCaptured(paymentEntity) {
  const found = await repository.findBookingIdByOrderId(paymentEntity.order_id);
  if (!found) {
    console.error('Webhook for unknown order:', paymentEntity.order_id);
    return;
  }
  const { bookingId } = found;

  if (!bookingId) {
    console.error('Webhook for unknown order:', paymentEntity.order_id);
    return;
  }

  const result = await withTransaction(pool, async (client) => {
    const booking = await repository.getBookingStatus(client, bookingId);
    if (!booking) {
      throw new Error(
        `Webhook order has no booking: ${paymentEntity.order_id}`
      );
    }

    const payment = await repository.getPaymentStatus(
      client,
      bookingId,
      paymentEntity.order_id
    );
    if (!payment) {
      throw new Error(
        `Webhook order has no payment: ${paymentEntity.order_id}`
      );
    }

    if (booking.status === 'confirmed' && payment.status === 'paid') {
      return { status: 'already_confirmed' };
    }

    if (
      booking.status === 'expired' &&
      ['refund_pending', 'refunded'].includes(payment.status)
    ) {
      return { status: 'already_refunding' };
    }

    if (booking.status === 'pending_payment' && payment.status === 'pending') {
      await confirmBookingAndPayment(client, payment.id, paymentEntity.id);
      const details = await fetchBookingDetails(
        client,
        bookingId,
        booking.userId
      );
      if (!details) {
        throw new Error(`Booking details not found: ${bookingId}`);
      }
      return { status: 'confirmed', details };
    }

    if (booking.status === 'expired' && payment.status === 'expired') {
      await markRefundPending(client, payment.id, paymentEntity.id);
      const details = await fetchBookingDetails(
        client,
        bookingId,
        booking.userId
      );
      if (!details) {
        throw new Error(`Booking details not found: ${bookingId}`);
      }
      return { status: 'refund_pending', details };
    }
  });

  if (result.status === 'confirmed') {
    await sendBookingConfirmationEmail({
      email: result.details.userEmail,
      bookingData: { ...result.details, id: result.details.bookingId },
    });
  }

  if (result.status === 'refund_pending') {
    await sendRefundStartedEmail({
      email: result.details.userEmail,
      bookingData: result.details,
    });
  }
  return;
}
