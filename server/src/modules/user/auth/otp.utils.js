import crypto from 'crypto';

export function generateOtpPair() {
  const otp = crypto.randomInt(100000, 1000000);
  const hashedOtp = crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(otp.toString())
    .digest('hex');

  return { otp, hashedOtp };
}

export function hashOtp(otp) {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(otp.toString())
    .digest('hex');
}
