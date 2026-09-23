import { pool } from '../../../infrastructure/database/db.js';

export async function findUserById(client, userId) {
  const result = await client.query(
    `SELECT id, email, role, status
     FROM users 
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(client, email) {
  const result = await client.query(
    `SELECT id 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  return result.rows[0]?.id ?? null;
}

export async function createUser(client, email) {
  const result = await client.query(
    `INSERT INTO users (email)
     VALUES ($1) 
     RETURNING id`,
    [email]
  );
  return result.rows[0].id;
}

export async function createAuthMethod(client, data) {
  await client.query(
    `INSERT INTO user_auth_methods
     (user_id, auth_provider, provider_identifier)
     VALUES ($1, $2, $3)`,
    [data.userId, data.authProvider, data.providerIdentifier]
  );
}

export async function createRefreshToken(client, data) {
  await client.query(
    `INSERT INTO refresh_tokens 
     (user_id, token_hash, expires_at) 
     VALUES ($1, $2, $3)`,
    [data.userId, data.tokenHash, data.expiresAt]
  );
}

export async function markRefreshTokenAsRevoked(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
    AND revoked_at IS NULL
    AND expires_at > NOW()`,
    [tokenHash]
  );
}
