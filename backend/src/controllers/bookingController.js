import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

import bookingService from '../services/booking/bookingService.js';

import {
  syncCompletedStatusForBooking,
  syncCompletedStatusesForBookings
} from '../services/booking/bookingStatus.service.js';

const sendServiceResponse = (res, result) => ApiResponse.success(
  res,
  result.data,
  result.message,
  result.statusCode,
  result.meta
);

export { syncCompletedStatusForBooking, syncCompletedStatusesForBookings };

export const getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings({ query: req.query });
  return sendServiceResponse(res, result);
});

export const getBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.getBooking({
    id: req.params.id,
    booking: req.booking
  });
  return sendServiceResponse(res, result);
});

export const createBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.createBooking({
    body: req.body,
    user: req.user
  });
  return sendServiceResponse(res, result);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.updateBooking({
    id: req.params.id,
    body: req.body,
    booking: req.booking
  });
  return sendServiceResponse(res, result);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.cancelBooking({
    id: req.params.id,
    body: req.body,
    booking: req.booking
  });
  return sendServiceResponse(res, result);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getMyBookings({
    query: req.query,
    user: req.user
  });
  return sendServiceResponse(res, result);
});

export const getOwnerBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getOwnerBookings({
    query: req.query,
    user: req.user
  });
  return sendServiceResponse(res, result);
});

export const confirmBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.confirmBooking({
    id: req.params.id,
    booking: req.booking
  });
  return sendServiceResponse(res, result);
});

export const completeBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.completeBooking({
    id: req.params.id,
    booking: req.booking
  });
  return sendServiceResponse(res, result);
});
