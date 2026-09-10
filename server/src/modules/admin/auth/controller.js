import { deleteAdminSession } from '../session/repository.js';
import { ADMIN_AUTH_CONFIG } from './config.js';
import { findAdminById } from './repository.js';
import { authenticateAdmin } from './service.js';

export async function handleLogin(req, res) {
  const { sessionId, admin } = await authenticateAdmin(req.body);

  res.cookie(
    ADMIN_AUTH_CONFIG.COOKIE_NAME,
    sessionId,
    ADMIN_AUTH_CONFIG.ADMIN_COOKIE_OPTIONS
  );

  return res.status(200).json({
    status: true,
    message: 'Login successful',
    data: admin,
  });
}

export async function handleLogout(req, res) {
  const sessionId = req.cookies[ADMIN_AUTH_CONFIG.COOKIE_NAME];
  await deleteAdminSession(sessionId);

  res.clearCookie(
    ADMIN_AUTH_CONFIG.COOKIE_NAME,
    ADMIN_AUTH_CONFIG.ADMIN_CLEAR_COOKIE_OPTIONS
  );

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function handleSession(req, res) {
  const data = await findAdminById(req.admin.id);

  return res.status(200).json({ success: true, data });
}
