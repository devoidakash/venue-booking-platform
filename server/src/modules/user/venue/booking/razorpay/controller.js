import crypto from 'crypto';

import * as service from './service.js';

export async function razorpayWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res
        .status(400)
        .json({ received: false, message: 'Missing signature' });
    }

    if (!Buffer.isBuffer(req.body)) {
      return res
        .status(400)
        .json({ received: false, message: 'Invalid request body' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res
        .status(400)
        .json({ received: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString('utf8'));

    if (event.event !== 'payment.captured') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) {
      return res.status(400).json({ received: false });
    }

    await service.paymentCaptured(payment);
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return res.status(500).json({ received: false });
  }
}
