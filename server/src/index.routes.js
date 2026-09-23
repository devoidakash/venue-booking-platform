import express from 'express';

import adminRoutes from './modules/admin/routes.js';
import userRoutes from './modules/user/routes.js';
import vendorRoutes from './modules/vendor/routes.js';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use(userRoutes);
router.use('/vendor', vendorRoutes);

export default router;
