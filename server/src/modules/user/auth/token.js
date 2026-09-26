import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateRefreshToken() {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  return { refreshToken, hashedRefreshToken };
}

export function generateTokenHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_SECRET, {
    expiresIn: '15m',
  });
}
