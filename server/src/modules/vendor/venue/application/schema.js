import { z } from 'zod';

const ALLOWED_CATEGORY = [
  'waterpark',
  'amusement_park',
  'trampoline_park',
  'playzone',
  'racing_zone',
  'gaming_zone',
  'turf',
];
const ALLOWED_STATES = [
  'Andhra Pradesh',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Karnataka',
];

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Venue name is required')
    .regex(/[a-zA-Z]/, 'Venue name must contain at least one letter'),

  venueDetails: z.string().trim().min(10, 'Venue details is required'),

  category: z.enum(ALLOWED_CATEGORY, {
    message:
      'Allowed category are waterpark, amusement_park, trampoline_park, racing_zone, gaming_zone, turf or playzone',
  }),

  address: z.string().trim().min(5, 'Full address is required'),

  district: z.string().trim().min(2, 'District is required'),

  state: z.enum(ALLOWED_STATES, {
    message:
      'State must be Chhattisgarh, Andhra Pradesh, Goa, Gujarat or Karnataka Pradesh',
  }),

  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),

  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude'),

  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude'),

  venueApplicationGroupId: z
    .string()
    .trim()
    .uuid({
      message: 'Invalid venue group id',
    })
    .optional(),
});

export default schema;
