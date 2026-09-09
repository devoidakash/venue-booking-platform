import { z } from 'zod';

export const venueId = z.object({
  venueId: z.string().trim().uuid({
    message: 'Invalid venue id',
  }),
});

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Invalid time format');

export const createBooking = z.discriminatedUnion('booking_type', [
  z.object({
    booking_date: z.coerce.date(),
    booking_type: z.literal('whole_day'),
    quantity: z.number().int().positive(),
  }),

  z
    .object({
      booking_date: z.coerce.date(),
      booking_type: z.literal('time_slot'),
      quantity: z.number().int().positive(),
      start_time: timeSchema,
      end_time: timeSchema,
    })
    .refine(
      ({ start_time, end_time }) => {
        const toMinutes = (time) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const start = toMinutes(start_time);
        const end = toMinutes(end_time);

        return end - start === 60;
      },
      {
        message: 'Time slot must be exactly 60 minutes',
        path: ['end_time'],
      }
    ),
]);

export const bookingId = z.object({
  venueId: z.string().trim().uuid({
    message: 'Invalid venue id',
  }),
});
