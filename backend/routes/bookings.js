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

const bookingListValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'])
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

// All routes require authentication
router.use(protect);

// Shared/General booking routes (Controller handles fine-grained authorization)
router.get('/my-bookings', bookingListValidation, getMyBookings);
router.get('/owner-bookings', authorize('landlord'), bookingListValidation, getOwnerBookings);
router.post('/', bookingValidation, createBooking);
router.put('/:id/confirm', authorize('landlord'), bookingIdValidation, confirmBooking);
router.put('/:id/complete', authorize('landlord'), bookingIdValidation, completeBooking);
router.get('/:id', bookingIdValidation, getBooking);
router.put('/:id', bookingIdValidation, updateBooking);
router.put('/:id/cancel', bookingIdValidation, cancelBooking);

// Admin routes
router.get('/', authorize('admin'), bookingListValidation, getBookings);

export default router;
