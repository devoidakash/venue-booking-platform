import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateRefreshToken() {
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  return { rawRefreshToken, hashedRefreshToken };
}

export function generateHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_SECRET, {
    expiresIn: '15m',
  });
}
