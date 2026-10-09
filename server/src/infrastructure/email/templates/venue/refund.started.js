function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function generateRefundPendingTemplate({ bookingData }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Refund pending - Venuz</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #f4f4f5; font-family: Arial, sans-serif; color: #18181b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="max-width: 100%; background-color: #ffffff; border: 1px solid #e4e4e7;">
                <tr>
                  <td style="height: 5px; background-color: #2563eb;"></td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px;">
                    <p style="margin: 0 0 24px; font-size: 20px; font-weight: 700;">Venuz</p>

                    <h1 style="margin: 0 0 12px; font-size: 24px;">Your payment requires a refund</h1>

                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">
                      Your booking expired before we could confirm it. Your payment requires a refund, and we'll process it shortly. Once initiated, the amount will be returned according to your payment provider's processing time.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a;">Booking</td>
                        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">${escapeHtml(bookingData?.bookingId)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #71717a;">Venue</td>
                        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">${escapeHtml(bookingData?.venueName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #71717a;">Refund amount</td>
                        <td align="right" style="padding: 12px 0; font-weight: 700;">₹${escapeHtml(bookingData?.totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 32px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a; text-align: center;">
                    Venuz customer support
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
