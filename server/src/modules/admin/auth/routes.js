import express from 'express';

import validateSchema from '../../../middleware/schema.validation.js';
import * as controller from './controller.js';
import validateAdminSession from './middleware.js';
import schema from './schema.js';

const router = express.Router();

router.post('/auth/login', validateSchema(schema), controller.login);

router.post('/auth/logout', controller.logout);

router.get('/auth/me', validateAdminSession, controller.getSession);

export default router;
