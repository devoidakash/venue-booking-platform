import { z } from 'zod';

const REJECTION_REASONS = [
  'pan_image_unclear',
  'pan_name_mismatch',
  'invalid_pan_number',
  'invalid_address',
  'invalid_phone',
  'document_not_supported',
  'duplicate_application',
];

const rejectionReason = z.enum(REJECTION_REASONS, {
  message: 'Invalid rejection reason',
});

const applicationStatus = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(['pending', 'approved', 'rejected'], {
      message: 'Status must be pending, approved, or rejected',
    })
  );

const reviewStatus = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(['approved', 'rejected'], {
      message: 'Review status must be either approved or rejected',
    })
  );

export const status = z.object({
  status: applicationStatus,
});

export const applicationId = z.object({
  applicationId: z
    .string()
    .trim()
    .uuid({ message: 'Invalid vendor application id' }),
});

export const review = z
  .object({
    status: reviewStatus,

    rejectionReason: rejectionReason.optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return !!data.rejectionReason;
      }
      return !data.rejectionReason;
    },
    {
      message:
        'Rejection reason is required when status is rejected and forbidden otherwise',
      path: ['rejectionReason'],
    }
  );
