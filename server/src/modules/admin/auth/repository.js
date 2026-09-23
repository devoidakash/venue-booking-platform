import { pool } from '../../../infrastructure/database/db.js';
import toCamelCase from '../../../utils/camelcase.conversion.js';

export async function fetchAdminByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash FROM admins WHERE email = $1 LIMIT 1`,
    [email]
  );
  return toCamelCase(result.rows[0]) || null;
}

export async function findAdminById(id) {
  const result = await pool.query(
    `SELECT id, email FROM admins WHERE id = $1 LIMIT 1`,
    [id]
  );
  return toCamelCase(result.rows[0]);
}
