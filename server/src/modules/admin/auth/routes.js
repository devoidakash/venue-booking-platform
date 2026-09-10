import express from 'express';

import validateSchema from '../../../middleware/schema.validation.js';
import { handleLogin, handleLogout, handleSession } from './controller.js';
import validateAdminSession from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.post('/auth/login', validateSchema(schema), handleLogin);

router.post('/auth/logout', validateAdminSession, handleLogout);

router.get('/auth/me', validateAdminSession, handleSession);

export default router;
