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

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ received: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString('utf8'));

    switch (event.event) {
      case 'payment.captured':
        await service.paymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await service.paymentFailed(event.payload.payment.entity);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return res.status(500).json({ received: false });
  }
}
