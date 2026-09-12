import { z } from 'zod';

const ALLOWED_CATEGORY = ['waterpark', 'amusement_park', 'turf', 'playzone'];
const ALLOWED_STATES = [
  'Andhra Pradesh',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
];

const schema = z.object({
  name: z.string().trim().min(1, 'Venue name is required'),

  venueDetails: z.string().trim().min(10, 'Venue details is required'),

  category: z.enum(ALLOWED_CATEGORY, {
    message: 'Allowed category are waterpark, amusement_park or playzone',
  }),

  address: z.string().trim().min(5, 'Full address is required'),

  district: z.string().trim().min(2, 'District is required'),

  state: z.enum(ALLOWED_STATES, {
    message:
      'State must be Chhattisgarh, Mumbai, Delhi, Gujarat or Madhya Pradesh',
  }),

  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),

  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude'),

  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  venueGroupId: z
    .string()
    .trim()
    .uuid({
      message: 'Invalid venue group id',
    })
    .optional(),
});

export default schema;
