import { ERROR_CONFIG } from '../../../config/error.config.js';
import { pool } from '../../../infrastructure/database/db.js';
import ApiError from '../../../utils/api.error.js';
import { withTransaction } from '../../../utils/transaction.js';
import sendOtpEmail from '../email.service.js';
import { USER_ERROR_CONFIG } from '../error.config.js';
import { generateOtpPair, hashOtp } from './otp.utils.js';
import * as redisRepository from './redis.repository.js';
import * as repository from './repository.js';
import * as token from './token.js';

export async function requestOtp(email) {
  await redisRepository.checkOtpRequestCoolDown(email);
  await redisRepository.checkOtpRequestRateLimit(email);
  const { otp, hashedOtp } = generateOtpPair();
  await redisRepository.storeOtp(email, hashedOtp);

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    await redisRepository.deleteOtp(email);
    await redisRepository.resetOtpRequestCoolDown(email);
    throw err;
  }
}

export async function verifyOtp({ email, otp }, ip) {
  await redisRepository.checkVerifyOtpRateLimit(email, ip);
  const matched = await redisRepository.verifyAndDeleteOtp(email, hashOtp(otp));

  if (!matched) {
    throw new ApiError(USER_ERROR_CONFIG.INVALID_OR_EXPIRED_OTP);
  }

  return await withTransaction(pool, async (client) => {
    const userId = await findOrCreateUser(client, email, 'otp', email);
    return await createSession(client, userId);
  });
}

async function findOrCreateUser(
  client,
  email,
  authProvider,
  providerIdentifier
) {
  const user = await repository.findUserByEmail(client, email);

  if (user) {
    if (user.status === 'banned') {
      throw new ApiError(USER_ERROR_CONFIG.USER_BANNED);
    }
    return user.id;
  }

  const userId = await repository.createUser(client, email);

  await repository.createAuthMethod(client, {
    userId,
    authProvider,
    providerIdentifier,
  });

  return userId;
}

async function createSession(client, userId) {
  const { refreshToken, hashedRefreshToken } = token.generateRefreshToken();

  await repository.createRefreshToken(client, {
    userId,
    tokenHash: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const accessToken = token.generateAccessToken(userId);
  return { refreshToken, accessToken };
}

export async function loginWithGoogle(data) {
  return withTransaction(pool, async (client) => {
    const userId = await findOrCreateUser(
      client,
      data.email,
      'google',
      data.sub
    );
    const refreshToken = await createRefreshToken(client, userId);
    const accessToken = token.generateAccessToken(userId);

    return { accessToken, refreshToken };
  });
}

export async function rotateSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }

  const hashedRefreshToken = token.generateHash(refreshToken);

  const { userId, refreshToken } = await withTransaction(
    pool,
    async (client) => {
      const userId = await repository.markRefreshTokenAsRevoked(
        client,
        hashedRefreshToken
      );

      if (!userId) {
        throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
      }

      const refreshToken = await createRefreshSession(client, userId);
      return { userId, refreshToken };
    }
  );

  const accessToken = token.generateAccessToken(userId);
  return { accessToken, refreshToken: refreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(ERROR_CONFIG.SESSION_EXPIRED);
  }
  const hashedRefreshToken = token.generateHash(refreshToken);

  await repository.markRefreshTokenAsRevoked(hashedRefreshToken);
}
