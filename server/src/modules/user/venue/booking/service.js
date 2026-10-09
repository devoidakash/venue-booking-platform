import crypto from 'node:crypto';

import storageKeys from '../../../../config/storageKeys.js';
import pool from '../../../../infrastructure/database/db.js';
import razorpay from '../../../../infrastructure/razorpay/razorpay.js';
import ApiError from '../../../../utils/api.error.js';
import { getFromCloudinary } from '../../../../utils/cloudinary.storage.js';
import { withTransaction } from '../../../../utils/transaction.js';
import {
  sendBookingConfirmationEmail,
  sendRefundStartedEmail,
} from '../../email.service.js';
import * as repository from '../booking/repository.js';
import { ERROR_CONFIG } from './error.config.js';

export async function getVenues() {
  const venues = await repository.getVenues();

  return Promise.all(
    venues.map(async (venue) => {
      const { vendorId, ...data } = venue;
      const coverImageKey = storageKeys.getVenueCoverImageKey(
        vendorId,
        data.id
      );
      return {
        ...data,
        coverImage: (await getFromCloudinary([coverImageKey]))[0],
      };
    })
  );
}

export async function getVenue(venueId) {
  const venue = await repository.getVenue(venueId);
  const { images, ...data } = venue;

  const imagesKey = await getFromCloudinary(images);

  return {
    ...data,
    images: imagesKey,
  };
}

export async function getVenuePricing(venueId) {
  const pricing = await repository.getVenuePricing(venueId);

  if (!pricing) {
    throw new ApiError(ERROR_CONFIG.VENUE_PRICING_NOT_FOUND);
  }

  return pricing;
}

export async function createBooking(userId, venueId, data) {
  const day = data.bookingDate.getUTCDay();
  const dayType = day === 0 || day === 6 ? 'weekend' : 'weekday';

  return await withTransaction(pool, async (client) => {
    const venue = await repository.getVenuePricingByFilter(
      client,
      venueId,
      data.bookingType,
      dayType
    );

    if (!venue) {
      throw new ApiError(ERROR_CONFIG.VENUE_NOT_FOUND);
    }

    if (
      data.bookingType === 'time_slot' &&
      (data.startTime < venue.openingTime || data.endTime > venue.closingTime)
    ) {
      throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_TIME_INVALID);
    }

    const { capacity, booked } = await repository.getVenueAvailability(
      client,
      venueId,
      data
    );

    if (capacity < booked + data.quantity) {
      throw new ApiError({
        statusCode: 400,
        message: `You can book a maximum of ${capacity - booked} tickets`,
        code: 'MAX_TICKET_LIMIT_REACHED',
      });
    }

    return repository.insertIntoBookings(client, userId, venueId, {
      ...data,
      totalAmount: data.quantity * venue.price,
    });
  });
}

export async function createPaymentOrder(userId, bookingId) {
  return withTransaction(pool, async (client) => {
    const booking = await repository.findBooking(client, userId, bookingId);
    if (!booking) {
      throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_NOT_FOUND);
    }

    const existingOrder = await repository.findExistingOrder(client, bookingId);
    if (existingOrder) {
      return {
        paymentId: existingOrder.id,
        orderId: existingOrder.gatewayOrderId,
        amount: existingOrder.amount * 100,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    }

    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    });

    const payment = await repository.insertIntoPayments(client, {
      bookingId: booking.id,
      orderId: order.id,
      totalAmount: booking.totalAmount,
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  });
}

export async function verifyPayment(user, bookingId, data) {
  const verifiedPayment = await razorpay.payments.fetch(data.razorpayPaymentId);

  if (!['authorized', 'captured'].includes(verifiedPayment.status)) {
    throw new ApiError(ERROR_CONFIG.PAYMENT_NOT_CAPTURED);
  }

  const result = await withTransaction(pool, async (client) => {
    const booking = await repository.getBookingStatus(
      client,
      bookingId,
      user.id
    );
    if (!booking) throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_NOT_FOUND);

    const payment = await repository.getPaymentStatus(client, bookingId);
    if (!payment) throw new ApiError(ERROR_CONFIG.VENUE_BOOKING_NOT_FOUND);

    if (booking.status === 'confirmed' && payment.status === 'paid') {
      const details = await repository.fetchBookingDetails(
        client,
        bookingId,
        user.id
      );
      return { status: 'confirmed', details };
    }

    if (
      booking.status === 'expired' &&
      ['refund_pending', 'refunded'].includes(payment.status)
    ) {
      const details = await repository.fetchBookingDetails(
        client,
        bookingId,
        user.id
      );
      return { status: payment.status, details };
    }

    if (payment.gatewayOrderId !== data.razorpayOrderId) {
      throw new ApiError(ERROR_CONFIG.PAYMENT_VERIFICATION_FAILED);
    }

    if (
      !verifyRazorpaySignature(
        payment.gatewayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature
      )
    ) {
      throw new ApiError(ERROR_CONFIG.INVALID_RAZORPAY_SIGNATURE);
    }

    if (verifiedPayment.status === 'authorized') {
      return { status: 'processing' };
    }

    if (booking.status === 'pending_payment' && payment.status === 'pending') {
      await repository.confirmBookingAndPayment(
        client,
        payment.id,
        data.razorpayPaymentId
      );
      const details = await repository.fetchBookingDetails(
        client,
        bookingId,
        user.id
      );
      return { status: 'confirmed', details, justConfirmed: true };
    }

    if (booking.status === 'expired' && payment.status === 'expired') {
      await repository.markRefundPending(
        client,
        payment.id,
        data.razorpayPaymentId
      );
      const details = await repository.fetchBookingDetails(
        client,
        bookingId,
        user.id
      );
      return { status: 'refund_pending', details };
    }
  });

  if (!result) {
    throw new ApiError(ERROR_CONFIG.PAYMENT_VERIFICATION_FAILED);
  }

  const { justConfirmed, ...response } = result;
  if (justConfirmed) {
    await sendBookingConfirmationEmail({
      email: result.details.userEmail,
      bookingData: { ...result.details, id: result.details.bookingId },
    });
  }
  if (response.status === 'refund_pending') {
    await sendRefundStartedEmail({
      email: response.details.userEmail,
      bookingData: response.details,
    });
  }
  return response;
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (typeof paymentId !== 'string' || typeof signature !== 'string')
    return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export async function getBookingHistory(userId) {
  return await repository.fetchBookingsHistory(userId);
}
