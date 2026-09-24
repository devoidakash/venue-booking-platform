import { z } from 'zod';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .toLowerCase()
    .email('Invalid email format'),

  password: z.string().refine((val) => val.trim().length >= 12, {
    message: 'Password must contain at least 12 non-space characters',
  }),
});

export default schema;
