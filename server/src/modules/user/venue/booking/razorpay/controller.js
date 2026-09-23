import crypto from 'crypto';

export async function handleRazorpayWebhook(req, res) {
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

    console.log('Razorpay webhook received:', event.event);

    const service = await import('./service.js');

    switch (event.event) {
      case 'payment.captured':
        await service.handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await service.handlePaymentFailed(event.payload.payment.entity);
        break;

      default:
        console.log('Unhandled Razorpay event:', event.event);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return res.status(500).json({ received: false });
  }
}
