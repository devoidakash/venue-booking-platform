import razorpay from '../../../../infrastructure/razorpay/razorpay.js';
import ApiError from '../../../../utils/api.error.js';
import { getFromCloudinary } from '../../../../utils/cloudinary.storage.js';
import * as repository from '../booking/repository.js';
import { ERROR_CONFIG } from './error.config.js';

export async function getVenues() {
  const data = await repository.getVenues();

  return Promise.all(
    data.map(async (venue) => {
      const { vendor_id, ...publicVenue } = venue;
      const coverImageId = [`venues/${vendor_id}/${venue.id}/cover_image`];
      return {
        ...publicVenue,
        cover_img_url: (await getFromCloudinary(coverImageId))[0],
      };
    })
  );
}

export async function getVenue(venueId) {
  const data = await repository.getVenue(venueId);
  const { vendor_id, images, ...venue } = data;

  const imagesUrl = await getFromCloudinary(images);

  return {
    ...venue,
    images: imagesUrl,
  };
}

export async function getVenuePricing(venueId) {
  const bookingType = await repository.getVenueBookingType(venueId);

  if (!bookingType) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }
  const pricing = await repository.getVenuePricing(venueId);

  if (!pricing.length) {
    throw new ApiError(ERROR_CONFIG.VENUE_PRICING_NOT_FOUND);
  }

  return { booking_type, pricing };
}

export async function createBooking(userId, venueId, data) {
  const day = new Date(data.booking_date).getDay();
  const dayType = day == 0 || day == 6 ? 'weekend' : 'weekday';

  try {
    const price = await repository.getBookingPrice({ venueId, dayType });

    if (!price) {
      throw new ApiError(ERROR_CONFIG.VENUE_PRICING_NOT_FOUND);
    }

    if (data.booking_type === 'whole_day') {
      return await repository.insertWholeDayBooking({
        userId,
        venueId,
        ...data,
        total_amount: price * data.quantity,
      });
    }
    if (data.booking_type === 'time_slot') {
      const timing = await repository.getVenueTiming(venueId);

      if (!timing) {
        throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
      }

      if (
        data.start_time < timing.opening_time ||
        data.end_time > timing.closing_time
      ) {
        throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_TIME_INVALID);
      }

      return await repository.insertTimeSlotBooking({
        userId,
        venueId,
        ...data,
        total_amount: price * data.quantity,
      });
    }
  } catch (err) {
    throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_FAILED);
  }
}

export async function createPaymentOrder(userId, bookingId) {
  try {
    const booking = await repository.getPaymentPrice(userId, bookingId);

    if (!booking) {
      throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_NOT_FOUND);
    }

    const order = await razorpay.orders.create({
      amount: booking.total_amount * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    });

    const paymentId = await repository.insertOrderId({
      bookingId: booking.id,
      orderId: order.id,
      totalAmount: booking.total_amount,
    });

    return {
      paymentId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (err) {
    console.log(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(ERROR_CONFIG.BOOKING_ORDER_CREATION_FAILED);
  }
}
