import { pool } from '../../../../../infrastructure/database/db.js';
import { withTransaction } from '../../../../../utils/transaction.js';
import { booking } from '../../../../vendor/venue/manage/schema.js';
import { sendBookingConfirmationEmail } from '../../../email.service.js';
import {
  confirmBooking,
  fetchVenueNameAndAddress,
  markPaymentPaid,
} from '../repository.js';
import * as repository from './repository.js';

export async function paymentCaptured(paymentEntity) {
  const payment = await repository.fetchPaymentByGatewayOrderId(
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
    return await confirmBooking(client, payment.bookingId);
  });
  try {
    await sendBookingConfirmationEmail({
      email: bookingData.userEmail,
      bookingData,
    });
  } catch (err) {
    console.error('Confirmation email failed:', err);
  }
}

export async function paymentFailed(paymentEntity) {
  const payment = await repository.fetchPaymentByGatewayOrderId(
    paymentEntity.order_id
  );
  if (!payment || payment.status !== 'pending') return;

  return await repository.markBookingAndPaymentFailed(
    payment.id,
    payment.bookingId
  );
}
