import 'dotenv/config';

import app from './app.js';
import './modules/user/venue/booking/bookingExpiry.job.js';

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server start running...`);
});
