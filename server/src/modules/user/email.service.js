import resend from '../../infrastructure/email/email.js';
import { generateBookingConfirmationTemplate } from '../../infrastructure/email/templates/venue/booking.confirmation.js';
import { generateBookingQR } from '../../utils/generateqr.js';
import * as repository from './venue/booking/repository.js';

const FROM = 'Venuz <noreply@venuz.shop>';

export async function sendBookingConfirmationEmail({
  email,
  bookingData,
  venue,
} = {}) {
  const qrDataUrl = await generateBookingQR(bookingData.id);
  const qrContent = qrDataUrl.replace(/^data:image\/png;base64,/, '');

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Venuz booking for ${venue.name} is confirmed`,
    html: generateBookingConfirmationTemplate({ bookingData, venue }),
    attachments: [
      {
        content: Buffer.from(qrContent, 'base64'),
        filename: 'booking-qr.png',
        contentId: 'booking-qr',
      },
    ],
  });
}
