import { z } from 'zod';

const schema = z.object({
  panName: z.string().min(2, 'Full name is required').trim().toUpperCase(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Invalid 10-digit phone number'),
  panNumber: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN format')
    .toUpperCase(),
  address: z.string().trim().min(5, 'Full address is required'),
  state: z.string().trim().min(1, 'State is required'),
  district: z.string().trim().min(2, 'District is required'),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
});

export default schema;
