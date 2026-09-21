import QRCode from 'qrcode';

export async function generateBookingQR(bookingId) {
  const qrDataUrl = await QRCode.toDataURL(bookingId, {
    width: 300,
    margin: 2,
  });
  return qrDataUrl;
}
