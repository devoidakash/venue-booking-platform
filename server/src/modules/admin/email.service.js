import resend from '../../infrastructure/email/email.js';
import { generateVendorApprovalTemplate } from '../../infrastructure/email/templates/vendor/application.approval.js';
import { generateVendorRejectionTemplate } from '../../infrastructure/email/templates/vendor/application.rejection.js';
import { generateVenueApprovalTemplate } from '../../infrastructure/email/templates/venue/application.approval.js';
import { generateVenueRejectionTemplate } from '../../infrastructure/email/templates/venue/application.rejection.js';

const FROM = 'Venuz <noreply@venuz.shop>';

export async function sendVendorApprovalMail({ email, vendorName } = {}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your Venuz vendor application was approved',
    html: generateVendorApprovalTemplate({ vendorName }),
  });
}

export async function sendVendorRejectionMail({
  email,
  vendorName,
  rejectionReason,
} = {}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Update on your Venuz vendor application',
    html: generateVendorRejectionTemplate({ vendorName, rejectionReason }),
  });
}

export async function sendVenueApprovalMail({
  email,
  vendorName,
  venueName,
} = {}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Venuz venue application for ${venueName} was approved`,
    html: generateVenueApprovalTemplate({ vendorName, venueName }),
  });
}

export async function sendVenueRejectionMail({
  email,
  vendorName,
  venueName,
  rejectionReason,
} = {}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Update on your Venuz venue application for ${venueName}`,
    html: generateVenueRejectionTemplate({
      vendorName,
      venueName,
      rejectionReason,
    }),
  });
}
