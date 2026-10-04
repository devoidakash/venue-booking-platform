import { toZonedTime } from 'date-fns-tz';
import { z } from 'zod';

const IST_TIMEZONE = 'Asia/Kolkata';

export const venueId = z.object({
  venueId: z.string().trim().uuid({
    message: 'Invalid venue id',
  }),
});

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Invalid time format');

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

function getNowInIST() {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

const isToday = (date) => {
  const now = getNowInIST();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const notInPast = (bookingDate) => {
  const today = getNowInIST();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
};

export const createBooking = z
  .discriminatedUnion('bookingType', [
    z.object({
      bookingDate: z.coerce.date(),
      bookingType: z.literal('whole_day'),
      quantity: z.number().int().positive(),
    }),
    z
      .object({
        bookingDate: z.coerce.date(),
        bookingType: z.literal('time_slot'),
        quantity: z.number().int().positive(),
        startTime: timeSchema,
        endTime: timeSchema,
      })
      .refine(({ startTime }) => startTime.endsWith(':00:00'), {
        message: 'Time slot must start on the hour',
        path: ['startTime'],
      })
      .refine(
        ({ startTime, endTime }) =>
          toMinutes(endTime) - toMinutes(startTime) === 60,
        { message: 'Time slot must be exactly 60 minutes', path: ['endTime'] }
      )
      .refine(
        ({ bookingDate, startTime }) => {
          if (!isToday(bookingDate)) return true;
          const now = getNowInIST();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          return toMinutes(startTime) >= nowMinutes;
        },
        {
          message: 'Selected time slot has already passed for today',
          path: ['startTime'],
        }
      ),
  ])
  .refine((data) => notInPast(data.bookingDate), {
    message: 'Booking date cannot be in the past',
    path: ['bookingDate'],
  })
  .refine(
    (data) => {
      const maxDate = getNowInIST();
      maxDate.setDate(maxDate.getDate() + 30);
      return data.bookingDate <= maxDate;
    },
    { message: 'Booking date is too far in the future', path: ['bookingDate'] }
  );

export const bookingId = z.object({
  bookingId: z.string().trim().uuid({
    message: 'Invalid booking id',
  }),
});

export const verifyPayment = z.object({
  razorpayPaymentId: z.string().trim().min(1),
  razorpayOrderId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});
