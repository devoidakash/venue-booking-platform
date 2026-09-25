import { ERROR_CONFIG } from '../../../config/error.config.js';
import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { withTransaction } from '../../../utils/transaction.js';
import sendOtpEmail from '../email.service.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { generateOtpPair, matchOtp } from './otp.utils.js';
import * as redisRepository from './redis.repository.js';
import * as repository from './repository.js';
import * as token from './token.js';

export async function requestOtp(email) {
  await redisRepository.checkCoolDown(email);
  await redisRepository.checkRateLimit(email);
  const { otp, hashedOtp } = generateOtpPair();
  await redisRepository.storeOtp(email, hashedOtp);

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    await redisRepository.deleteOtp(email);
    throw err;
  }
}

export async function verifyOtp({ email, otp }) {
  const hashedOtp = await redisRepository.getOtp(email);

  if (!hashedOtp || !matchOtp(otp, hashedOtp)) {
    throw new ApiError(USER_ERROR_CONFIG.INVALID_OR_EXPIRED_OTP);
  }

  const authTokens = await withTransaction(pool, async (client) => {
    const userId = await findOrCreateUser(client, email, 'otp', email);
    const refreshToken = await createRefreshSession(client, userId);
    const accessToken = token.generateAccessToken(userId);
    return { accessToken, refreshToken };
  });
  await redisRepository.deleteOtp(email);
  return authTokens;
}

export async function loginWithGoogle(data) {
  return withTransaction(pool, async (client) => {
    const userId = await findOrCreateUser(
      client,
      data.email,
      'google',
      data.sub
    );
    const refreshToken = await createRefreshSession(client, userId);
    const accessToken = token.generateAccessToken(userId);

    return { accessToken, refreshToken };
  });
}

async function findOrCreateUser(
  client,
  email,
  authProvider,
  providerIdentifier
) {
  const existingId = await repository.findUserByEmail(client, email);
  if (existingId) return existingId;

  const userId = await repository.createUser(client, email);

  await repository.createAuthMethod(client, {
    userId,
    authProvider,
    providerIdentifier,
  });

  return userId;
}

async function createRefreshSession(client, userId) {
  const { rawToken, hashedToken } = token.generateAuthToken();

  await repository.createRefreshToken(client, {
    userId,
    tokenHash: hashedToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return rawToken;
}

export async function rotateSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }

  const hashedRefreshToken = token.generateHash(refreshToken);

  const { userId, rawRefreshToken } = await withTransaction(
    pool,
    async (client) => {
      const userId = await repository.markRefreshTokenAsRevoked(
        client,
        hashedRefreshToken
      );

      if (!userId) {
        throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
      }

      const rawRefreshToken = await createRefreshSession(client, userId);
      return { userId, rawRefreshToken };
    }
  );

  const accessToken = token.generateAccessToken(userId);
  return { accessToken, refreshToken: rawRefreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }
  const hashedRefreshToken = token.generateHash(refreshToken);

  await repository.markRefreshTokenAsRevoked(hashedRefreshToken);
}
