import crypto from 'node:crypto';

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (typeof paymentId !== 'string' || typeof signature !== 'string')
    return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
