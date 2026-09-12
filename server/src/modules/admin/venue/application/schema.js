import z from 'zod';

const REJECTION_REASONS = [
  'venue_name_mismatch',
  'venue_address_mismatch',
  'document_unclear',
  'document_expired',
  'invalid_document',
  'document_not_supported',
  'venue_photos_unclear',
  'venue_photos_inappropriate',
  'venue_not_found',
  'venue_not_operational',
  'suspicious_or_fraudulent_information',
];

const rejectionReason = z.enum(REJECTION_REASONS, {
  message: 'Invalid rejection reason',
});

const applicationStatus = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.enum(['pending', 'approved', 'rejected']));

const reviewStatus = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(['approved', 'rejected'], {
      message: 'Status must be either approved or rejected',
    })
  );

export const status = z.object({
  status: applicationStatus,
});

export const applicationId = z.object({
  applicationId: z.string().trim().uuid({
    message: 'Invalid venue application id',
  }),
});

export const review = z
  .object({
    status: reviewStatus,

    rejection_reason: rejectionReason.optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return !!data.rejection_reason;
      }

      return !data.rejection_reason;
    },
    {
      message:
        'Rejection reason is required when status is rejected and forbidden otherwise',
      path: ['rejection_reason'],
    }
  );
