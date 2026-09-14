import { z } from 'zod';

const reverificationSchema = z.object({
  name: z.string().trim().min(1, 'Venue name is required'),

  category: z.enum(['waterpark', 'amusement_park', 'playzone'], {
    message: 'Allowed category are waterpark, amusement_park or playzone',
  }),

  address: z.string().trim().min(5, 'Full address is required'),

  district: z.string().trim().min(2, 'District is required'),

  state: z.string().trim().min(1, 'State is required'),

  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),

  latitude: z.coerce.number().min(-90).max(90),

  longitude: z.coerce.number().min(-180).max(180),
});

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):00$/, {
    message: 'Operation time must use a full hour (HH:00)',
  });

const wholeDayPricingSchema = z.object({
  day_type: z.enum(['weekday', 'weekend']),
  price: z.number().int().positive(),
});

const timeSlotPricingSchema = z.object({
  day_type: z.enum(['weekday', 'weekend']),
  duration_minutes: z
    .number()
    .int()
    .refine((value) => [60].includes(value), {
      message: 'Invalid duration time',
    }),
  price: z.number().int().positive(),
});

export const applicationId = z.object({
  applicationId: z.string().trim().uuid({
    message: 'Invalid application id',
  }),
});

export const venueId = z.object({
  venueId: z.string().trim().uuid({
    message: 'Invalid venue id',
  }),
});

export const deleteIds = z.object({
  deleteIds: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },

    z
      .array(
        z.string().trim().uuid({
          message: 'Invalid image id',
        })
      )
      .max(10)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: 'Duplicate image ids are not allowed',
      })
  ),
});

export const description = z.object({
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
});

export const hours = z
  .object({
    opening_time: timeSchema,
    closing_time: timeSchema,
  })
  .refine(({ opening_time, closing_time }) => opening_time < closing_time, {
    message: 'Opening time must be before closing time',
    path: ['closing_time'],
  });

export const pricing = z.discriminatedUnion('booking_type', [
  z.object({
    booking_type: z.literal('whole_day'),
    pricing: z.array(wholeDayPricingSchema).min(1),
  }),

  z.object({
    booking_type: z.literal('time_slot'),
    pricing: z.array(timeSlotPricingSchema).min(1),
  }),
]);

export const reverification = reverificationSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for reverification',
  });

export const status = z.object({
  status: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z.enum(['draft', 'live'], {
        message: 'Status must be either draft or live',
      })
    ),
});
