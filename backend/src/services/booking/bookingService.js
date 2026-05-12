import Booking from '../../models/Booking.js';
import Car from '../../models/Car.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

import { validateDates } from './bookingRules.service.js';
import { calculatePricing } from './bookingPricing.service.js';
import { getScopedBookings } from './bookingQuery.service.js';
import {
  buildBookingResponse,
  serviceResult
} from './bookingMapper.service.js';
import {
  buildFallbackLocationAddress,
  getUserId,
  getUserObjectId,
  roundCurrency,
  toIdString
} from './booking.utils.js';
import {
  applyBookingStatusTransition,
  syncCompletedStatusesForBookings
} from './bookingStatus.service.js';

export const createBooking = async ({ body, user }) => {
  const { start, end } = validateDates(body.startDate, body.endDate);

  const car = await Car.findById(body.car);
  if (!car) throw new ApiError(404, 'Car not found');

  if (toIdString(car.owner) === getUserId(user)) {
    throw new ApiError(400, 'You cannot book your own car');
  }

  if (!car.isAvailable || car.status !== 'available') {
    throw new ApiError(400, 'Car is not available for booking');
  }

  const overlappingBooking = await Booking.findOverlappingBookings(car._id, start, end).limit(1);
  if (overlappingBooking.length > 0) {
    throw new ApiError(400, 'Car is already booked for the selected dates');
  }

  const pricing = calculatePricing({
    car,
    start,
    end,
    insuranceType: body.insuranceType,
    additionalServices: body.additionalServices
  });

  const address = body.pickupLocation?.address || buildFallbackLocationAddress(car);

  const booking = new Booking({
    customer: getUserId(user),
    owner: car.owner,
    car: car._id,
    startDate: start,
    endDate: end,
    pickupLocation: { address, ...body.pickupLocation },
    returnLocation: { address: body.returnLocation?.address || address, ...body.returnLocation },
    insurance: { type: body.insuranceType || 'basic' },
    specialRequests: body.specialRequests,
    ...pricing,
    status: 'pending'
  });

  await booking.save();

  logger.info('Booking created');

  return serviceResult({
    statusCode: 201,
    message: 'Booking created',
    data: buildBookingResponse(booking)
  });
};

export const getBookings = async ({ query }) => {
  const result = await getScopedBookings({ query });
  const { bookings, ...meta } = result;
  return serviceResult({ data: bookings, meta });
};

const findBookingOrThrow = async (id, existingBooking = null) => {
  const booking = existingBooking || await Booking.findById(id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  return booking;
};

const populateBookingDetails = async (booking) => (
  booking.populate ? booking.populate('car customer owner') : booking
);

export const getBooking = async ({ id, booking: ownedBooking = null }) => {
  const booking = await findBookingOrThrow(id, ownedBooking);
  const populatedBooking = await populateBookingDetails(booking);

  return serviceResult({ data: buildBookingResponse(populatedBooking) });
};

export const getMyBookings = async ({ query, user }) => {
  const result = await getScopedBookings({
    query,
    scope: { customer: getUserObjectId(user) }
  });
  const { bookings, ...meta } = result;
  return serviceResult({ data: bookings, meta });
};

export const getOwnerBookings = async ({ query, user }) => {
  const result = await getScopedBookings({
    query,
    scope: { owner: getUserObjectId(user) }
  });
  const { bookings, ...meta } = result;
  return serviceResult({ data: bookings, meta });
};

export const cancelBooking = async ({ id, body, booking: ownedBooking = null }) => {
  const booking = await findBookingOrThrow(id, ownedBooking);
  const previousStatus = booking.status;
  const reason = body?.reason || 'customer_request';

  if (!booking.canCancel()) {
    throw new ApiError(400, 'Booking cannot be cancelled in its current status');
  }

  applyBookingStatusTransition(booking, 'cancelled');
  booking.cancellationReason = reason;
  booking.cancellationDetails = body?.cancellationDetails?.trim();

  if (reason === 'customer_request' && ['confirmed', 'active'].includes(previousStatus)) {
    booking.cancellationFee = roundCurrency(Number(booking.totalAmount || 0) * 0.10);
  }
  
  await booking.save();

  return serviceResult({ message: 'Booking cancelled', data: buildBookingResponse(booking) });
};

export const confirmBooking = async ({ id, booking: ownedBooking = null }) => {
  const booking = await findBookingOrThrow(id, ownedBooking);

  if (!booking.canTransitionTo('confirmed')) {
    throw new ApiError(400, 'Booking cannot be confirmed in its current status');
  }

  const overlappingBooking = await Booking.findOverlappingBookings(
    booking.car?._id || booking.car,
    booking.startDate,
    booking.endDate,
    booking._id
  ).limit(1);

  if (overlappingBooking.length > 0) {
    throw new ApiError(400, 'Car is already booked for the selected dates');
  }

  applyBookingStatusTransition(booking, 'confirmed');
  await booking.save();

  return serviceResult({ message: 'Booking confirmed', data: buildBookingResponse(booking) });
};

export const completeBooking = async ({ id, booking: ownedBooking = null }) => {
  const booking = await findBookingOrThrow(id, ownedBooking);

  if (!booking.canTransitionTo('completed')) {
    throw new ApiError(400, 'Booking cannot be completed in its current status');
  }

  applyBookingStatusTransition(booking, 'completed');
  await booking.save();

  return serviceResult({ message: 'Booking completed', data: buildBookingResponse(booking) });
};

export const updateBooking = async ({ id, body, booking: ownedBooking = null }) => {
  const booking = await findBookingOrThrow(id, ownedBooking);

  Object.assign(booking, body);
  await booking.save();

  return serviceResult({ message: 'Booking updated', data: buildBookingResponse(booking) });
};

export default {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getMyBookings,
  getOwnerBookings,
  confirmBooking,
  completeBooking
};
