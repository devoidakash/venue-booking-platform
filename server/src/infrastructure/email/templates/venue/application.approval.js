export function generateVenueApprovalTemplate({
  vendorName = 'Vendor',
  venueName = 'your venue',
} = {}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Venuz venue application was approved</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden;">
                <tr><td style="height: 5px; background-color: #16a34a;"></td></tr>
                <tr>
                  <td style="padding: 40px 40px 32px;">
                    <p style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #18181b;">Venuz</p>
                    <p style="margin: 0 0 32px; font-size: 14px; color: #71717a;">Venue application update</p>
                    <p style="margin: 0 0 16px; font-size: 16px; color: #27272a;">Hello ${vendorName},</p>
                    <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: #166534;">Your venue is approved</h1>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">Your venue application for <strong>${venueName}</strong> has been approved and the venue is now available on Venuz.</p>
                    <div style="padding: 18px 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #166534;">You can now sign in to manage your venue and receive bookings.</p>
                    </div>
                    <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">Thank you for choosing Venuz.</p>
                  </td>
                </tr>
                <tr><td style="padding: 20px 40px; border-top: 1px solid #f4f4f5;"><p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">© ${new Date().getFullYear()} Venuz - Book your venues</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
