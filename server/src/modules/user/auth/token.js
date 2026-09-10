import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateAuthToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  return { rawToken, hashedToken };
}

export function generateHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_SECRET, {
    expiresIn: '15m',
  });
}
