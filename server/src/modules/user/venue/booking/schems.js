import { z } from 'zod';

export const venueId = z.object({
  venueId: z.string().trim().uuid({
    message: 'Invalid venue id',
  }),
});

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Invalid time format');

export const createBooking = z.discriminatedUnion('bookingType', [
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
    .refine(
      ({ startTime, endTime }) => {
        const toMinutes = (time) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const start = toMinutes(startTime);
        const end = toMinutes(endTime);

        return end - start === 60;
      },
      {
        message: 'Time slot must be exactly 60 minutes',
        path: ['endTime'],
      }
    ),
]);

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
