import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import router from './index.routes.js';
import errorHandler from './middleware/error.handler.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/', router);
app.use(errorHandler);

export default app;
