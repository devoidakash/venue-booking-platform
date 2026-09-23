import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const email = z.object({
  email: emailSchema,
});

export const credentials = z.object({
  email: emailSchema,

  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});
