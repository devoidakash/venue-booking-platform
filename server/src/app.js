import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import router from './index.routes.js';
import errorHandler from './middleware/error.handler.js';
import { razorpayWebhook } from './modules/user/venue/booking/razorpay/controller.js';

const app = express();
app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/', router);
app.use(errorHandler);

export default app;
