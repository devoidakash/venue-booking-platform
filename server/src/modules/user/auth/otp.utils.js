import crypto from 'crypto';

export function generateOtpPair() {
  const otp = crypto.randomInt(100000, 1000000);
  const hashedOtp = crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(otp.toString())
    .digest('hex');

  return { otp, hashedOtp };
}

export function matchOtp(otp, hashedOtp) {
  const generatedHash = crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(otp.toString())
    .digest('hex');

  const bufferA = Buffer.from(generatedHash, 'hex');
  const bufferB = Buffer.from(hashedOtp, 'hex');

  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}
