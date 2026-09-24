import crypto from 'crypto';

import { redis } from '../../../infrastructure/redis/redis.js';
import { ADMIN_AUTH_CONFIG } from '../auth/config.js';

export async function createAdminSession(adminId) {
  const sessionId = crypto.randomUUID();
  const key = `${ADMIN_AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;

  const sessionData = {
    adminId,
    createdAt: new Date().toISOString(),
  };

  await redis.set(key, sessionData, { ex: ADMIN_AUTH_CONFIG.SESSION_TTL });

  return sessionId;
}

export async function getAdminSession(sessionId) {
  const key = `${ADMIN_AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
  return await redis.get(key);
}

export async function deleteAdminSession(sessionId) {
  if (!sessionId) return;
  const key = `${ADMIN_AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
  return await redis.del(key);
}
