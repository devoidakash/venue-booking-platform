import cron from 'node-cron';

import { expireStaleBookings } from './repository.js';

cron.schedule('* * * * *', async () => {
  try {
    const expiredCount = await expireStaleBookings();
    console.log(`Expired ${expiredCount} stale bookings`);
  } catch (err) {
    console.error('Failed to expire stale bookings:', err);
  }
});
