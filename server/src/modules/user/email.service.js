import { ERROR_CONFIG } from '../../config/error.config.js';
import resend from '../../infrastructure/email/email.js';
import { generateOtpTemplate } from '../../infrastructure/email/templates/otp.template.js';
import { generateBookingConfirmationTemplate } from '../../infrastructure/email/templates/venue/booking.confirmation.js';
import ApiError from '../../utils/api.error.js';
import { generateBookingQR } from '../../utils/generateqr.js';

const FROM = 'Venuz <noreply@venuz.shop>';

export default async function sendOtpEmail(email, otp) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your Venuz Verification Code',
      html: generateOtpTemplate(otp),
    });
  } catch (error) {
    throw new ApiError(ERROR_CONFIG.EMAIL_SEND_FAILED);
  }
}

export async function sendBookingConfirmationEmail({ email, bookingData }) {
  const qrDataUrl = await generateBookingQR(bookingData.id);
  const qrContent = qrDataUrl.replace(/^data:image\/png;base64,/, '');

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Venuz booking for ${bookingData.venueName} is confirmed`,
    html: generateBookingConfirmationTemplate({ bookingData }),
    attachments: [
      {
        content: Buffer.from(qrContent, 'base64'),
        filename: 'booking-qr.png',
        contentId: 'booking-qr',
      },
    ],
  });
}
