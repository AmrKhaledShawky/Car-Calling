import express from 'express';
import { body, param } from 'express-validator';
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
import { protect, authorize, ownerOrAdmin } from '../middleware/auth.js';

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

// All routes require authentication
router.use(protect);

// Shared/General booking routes (Controller handles fine-grained authorization)
router.get('/my-bookings', getMyBookings);
router.post('/', bookingValidation, createBooking);
router.get('/:id', bookingIdValidation, getBooking);
router.put('/:id', bookingIdValidation, updateBooking);
router.put('/:id/cancel', bookingIdValidation, cancelBooking);

// Owner routes (for landlords)
router.get('/owner-bookings', authorize('landlord'), getOwnerBookings);
router.put('/:id/confirm', authorize('landlord'), bookingIdValidation, confirmBooking);
router.put('/:id/complete', authorize('landlord'), bookingIdValidation, completeBooking);

// Admin routes
router.get('/', authorize('admin'), getBookings);

export default router;
