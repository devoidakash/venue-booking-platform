function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  const dateValue = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(dateValue);
}

function formatTime(value) {
  if (!value) {
    return 'Full day';
  }

  const timeValue = String(value).match(/^(\d{2}):(\d{2})/);

  if (!timeValue) {
    return 'Time unavailable';
  }

  const [, hours, minutes] = timeValue;
  const hour = Number(hours);
  const minute = Number(minutes);

  if (hour > 23 || minute > 59) {
    return 'Time unavailable';
  }

  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';

  return `${displayHour}:${minutes} ${period}`;
}

export function generateBookingConfirmationTemplate({ bookingData }) {
  const bookingType =
    bookingData?.bookingType === 'whole_day' ? 'Full-day' : 'Time-based';
  const timeSlot =
    bookingData?.bookingType === 'whole_day'
      ? 'All day'
      : `${formatTime(bookingData?.startTime)} - ${formatTime(bookingData?.endTime)}`;

  return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Booking confirmed - Venuz</title>
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
										<p style="margin: 0 0 32px; font-size: 14px; color: #71717a;">Booking confirmation</p>
										<h1 style="margin: 0 0 12px; font-size: 28px; line-height: 1.2; color: #166534;">Your booking is confirmed</h1>
										<p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">Thank you for booking with Venuz. Keep this confirmation handy for your visit.</p>

										<div style="padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
											<p style="margin: 0 0 6px; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">Venue</p>
											<p style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #14532d;">${escapeHtml(bookingData?.venueName)}</p>
											<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #166534;">${escapeHtml(bookingData?.venueAddress)}</p>
										</div>

										<table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-collapse: collapse;">
											<tr><td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #71717a; font-size: 14px;">Date</td><td align="right" style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 14px; font-weight: 600;">${escapeHtml(formatDate(bookingData?.bookingDate))}</td></tr>
											<tr><td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #71717a; font-size: 14px;">Time slot</td><td align="right" style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 14px; font-weight: 600;">${escapeHtml(timeSlot)}</td></tr>
											<tr><td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #71717a; font-size: 14px;">Ticket type</td><td align="right" style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 14px; font-weight: 600;">${bookingType} (${escapeHtml(bookingData?.quantity)} people)</td></tr>
											<tr><td style="padding: 12px 0; color: #71717a; font-size: 14px;">Total paid</td><td align="right" style="padding: 12px 0; color: #18181b; font-size: 18px; font-weight: 700;">₹${escapeHtml(bookingData?.totalAmount)}</td></tr>
										</table>

										<div style="margin-top: 24px; text-align: center;">
											<p style="margin: 0 0 12px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Scan to check in</p>
											<img src="cid:booking-qr" width="220" height="220" alt="Booking QR code" style="display: block; width: 220px; height: 220px; margin: 0 auto;" />
										</div>
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
