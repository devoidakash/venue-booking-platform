import cron from 'node-cron';

import { expireStaleBookings } from './repository.js';

cron.schedule('*/15 * * * *', async () => {
  try {
    await expireStaleBookings;
  } catch (err) {
    console.error('Failed to expire stale bookings:', err);
  }
});
