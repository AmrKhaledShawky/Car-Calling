import express from 'express';
import { body, param, query } from 'express-validator';
import {
  cancelBooking,
  createBooking,
  getBooking,
  getMyBookings,
  updateBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validateBookingOwnership } from '../middleware/ownership.middleware.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

const bookingValidation = [
  body('car')
    .isMongoId()
    .withMessage('Please provide a valid car ID'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('pickupLocation.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pickup address cannot be empty'),
  body('returnLocation.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Return address cannot be empty'),
  body('insuranceType')
    .optional()
    .isIn(['basic', 'premium', 'none'])
    .withMessage('Insurance type must be basic, premium, or none'),
  body('additionalServices')
    .optional()
    .isArray()
    .withMessage('Additional services must be an array')
];

const bookingIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid booking ID')
];

const cancelBookingValidation = [
  ...bookingIdValidation,
  body('reason')
    .optional()
    .isIn(['customer_request', 'owner_cancelled', 'owner_rejected', 'payment_failed', 'system_cancelled', 'no_show'])
    .withMessage('Please provide a valid cancellation reason'),
  body('cancellationDetails')
    .optional()
    .isString()
    .withMessage('Cancellation details must be text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Cancellation details must be between 1 and 500 characters')
];

const bookingListValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected', 'no_show'])
    .withMessage('Please provide a valid booking status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateBookingDetails = validateRequest('Please check your booking details and try again.');
const validatePrivateRequest = validateRequest();

router.use(protect);

router.route('/bookings')
  .get(bookingListValidation, validatePrivateRequest, getMyBookings)
  .post(bookingValidation, validateBookingDetails, createBooking);

router.route('/bookings/:id')
  .get(bookingIdValidation, validatePrivateRequest, validateBookingOwnership, getBooking)
  .put(bookingIdValidation, validatePrivateRequest, validateBookingOwnership, updateBooking);

router.put('/bookings/:id/cancel', cancelBookingValidation, validatePrivateRequest, validateBookingOwnership, cancelBooking);

export default router;
