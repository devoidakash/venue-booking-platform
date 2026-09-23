import crypto from 'crypto';

import { pool } from '../../../../infrastructure/database/db.js';
import razorpay from '../../../../infrastructure/razorpay/razorpay.js';
import ApiError from '../../../../utils/api.error.js';
import { getFromCloudinary } from '../../../../utils/cloudinary.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import { sendBookingConfirmationEmail } from '../../email.service.js';
import * as repository from '../booking/repository.js';
import { ERROR_CONFIG } from './error.config.js';

export async function getVenues() {
  const data = await repository.getVenues();

  return Promise.all(
    data.map(async (venue) => {
      const { vendorId, ...publicVenue } = venue;
      const coverImageId = [`venues/${vendorId}/${venue.id}/cover_image`];
      return {
        ...publicVenue,
        cover_img_url: (await getFromCloudinary(coverImageId))[0],
      };
    })
  );
}

export async function getVenue(venueId) {
  const data = await repository.getVenue(venueId);
  const { images, ...venue } = data;

  const imagesUrl = await getFromCloudinary(images);

  return {
    ...venue,
    images: imagesUrl,
  };
}

export async function getVenuePricing(venueId) {
  const { bookingType } = await repository.getVenueBookingType(venueId);

  if (!bookingType) {
    throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
  }
  const pricing = await repository.getVenuePricing(venueId);

  if (!pricing.length) {
    throw new ApiError(ERROR_CONFIG.VENUE_PRICING_NOT_FOUND);
  }

  return { bookingType, pricing };
}

export async function createBooking(userId, venueId, data) {
  const [year, month, dayNum] = data.bookingDate.split('-').map(Number);
  const day = new Date(year, month - 1, dayNum).getDay();
  const dayType = day == 0 || day == 6 ? 'weekend' : 'weekday';

  try {
    const price = await repository.getBookingPrice({ venueId, dayType });

    if (!price) {
      throw new ApiError(ERROR_CONFIG.VENUE_PRICING_NOT_FOUND);
    }

    if (data.bookingType === 'whole_day') {
      const existingBooking = await repository.getExistingBooking({
        userId,
        venueId,
        ...data,
        startTime: null,
        endTime: null,
        totalAmount: price * data.quantity,
      });

      if (existingBooking) return existingBooking;

      return await repository.insertWholeDayBooking({
        userId,
        venueId,
        ...data,
        totalAmount: price * data.quantity,
      });
    }

    if (data.bookingType === 'time_slot') {
      const existingBooking = await repository.getExistingBooking({
        userId,
        venueId,
        ...data,
        totalAmount: price * data.quantity,
      });

      if (existingBooking) return existingBooking;

      const timing = await repository.getVenueTiming(venueId);

      if (!timing) {
        throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
      }

      if (
        data.startTime < timing.openingTime ||
        data.endTime > timing.closingTime
      ) {
        throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_TIME_INVALID);
      }

      return await repository.insertTimeSlotBooking({
        userId,
        venueId,
        ...data,
        totalAmount: price * data.quantity,
      });
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
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
      amount: booking.totalAmount * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    });

    const paymentId = await repository.insertOrderId({
      bookingId: booking.id,
      orderId: order.id,
      totalAmount: booking.totalAmount,
    });

    return {
      paymentId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (err) {
    console.log(err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(ERROR_CONFIG.BOOKING_ORDER_CREATION_FAILED);
  }
}

export async function verifyPayment(user, bookingId, data) {
  try {
    const payment = await repository.getPaymentForVerification(
      user.id,
      bookingId
    );

    if (!payment) {
      throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_NOT_FOUND);
    }

    if (payment.gatewayOrderId !== data.razorpayOrderId) {
      throw new ApiError(ERROR_CONFIG.PAYMENT_VERIFICATION_FAILED);
    }

    const body = `${payment.gatewayOrderId}|${data.razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new ApiError(ERROR_CONFIG.PAYMENT_VERIFICATION_FAILED);
    }

    const verifiedPayment = await razorpay.payments.fetch(
      data.razorpayPaymentId
    );

    if (verifiedPayment.status !== 'captured') {
      throw new ApiError(ERROR_CONFIG.PAYMENT_NOT_CAPTURED);
    }

    return withTransaction(pool, async (client) => {
      await repository.markPaymentPaid(
        client,
        payment.id,
        data.razorpayPaymentId
      );
      const bookingData = await repository.confirmBooking(client, bookingId);
      const venue = await repository.fetchVenueNameAndAddress(
        bookingData.venueId
      );
      await sendBookingConfirmationEmail({
        email: user.email,
        bookingData,
        venue,
      });
      return bookingData;
    });
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    console.log(err);
    throw new ApiError(ERROR_CONFIG.PAYMENT_VERIFICATION_FAILED);
  }
}

export async function getBookingHistory(userId) {
  return await repository.fetchBookingsHistory(userId);
}
