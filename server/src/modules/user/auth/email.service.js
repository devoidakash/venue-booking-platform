import { ERROR_CONFIG } from '../../../config/error.config.js';
import resend from '../../../infrastructure/email/email.js';
import { generateOtpTemplate } from '../../../infrastructure/email/templates/otp.template.js';
import ApiError from '../../../utils/api.error.js';

export default async function sendOtpEmail(email, otp) {
  try {
    const response = await resend.emails.send({
      from: 'Venuz <noreply@venuz.shop>',
      to: email,
      subject: 'Your Venuz Verification Code',
      html: generateOtpTemplate(otp),
    });

    console.log(otp);
    return response;
  } catch (error) {
    throw new ApiError(ERROR_CONFIG.EMAIL_SEND_FAILED);
  }
}
