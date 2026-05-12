import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getMyBookings,
  getOwnerBookings,
  confirmBooking,
  completeBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateBookingOwner,
  validateBookingOwnership
} from '../middleware/ownership.middleware.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
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
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid startDate filter'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid endDate filter'),
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
const validateBookingRequest = validateRequest();

// All routes require authentication
router.use(protect);

// Shared/General booking routes (Controller handles fine-grained authorization)
router.get('/my-bookings', bookingListValidation, validateBookingRequest, getMyBookings);
router.get('/owner-bookings', authorize('landlord'), bookingListValidation, validateBookingRequest, getOwnerBookings);
router.post('/', bookingValidation, validateBookingDetails, createBooking);
router.put('/:id/confirm', authorize('landlord'), bookingIdValidation, validateBookingRequest, validateBookingOwner, confirmBooking);
router.put('/:id/complete', authorize('landlord'), bookingIdValidation, validateBookingRequest, validateBookingOwner, completeBooking);
router.get('/:id', bookingIdValidation, validateBookingRequest, validateBookingOwnership, getBooking);
router.put('/:id', bookingIdValidation, validateBookingRequest, validateBookingOwnership, updateBooking);
router.put('/:id/cancel', cancelBookingValidation, validateBookingRequest, validateBookingOwnership, cancelBooking);

// Admin routes
router.get('/', authorize('admin'), bookingListValidation, validateBookingRequest, getBookings);

export default router;
