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
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('returnLocation.address')
    .trim()
    .notEmpty()
    .withMessage('Return address is required')
];

const bookingIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid booking ID')
];

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-bookings', getMyBookings);
router.post('/', bookingValidation, createBooking);

// Owner routes
router.get('/owner-bookings', authorize('landlord'), getOwnerBookings);
router.put('/:id/confirm', authorize('landlord'), bookingIdValidation, ownerOrAdmin, confirmBooking);
router.put('/:id/complete', authorize('landlord'), bookingIdValidation, ownerOrAdmin, completeBooking);

// Admin routes
router.get('/', authorize('admin'), getBookings);
router.get('/:id', authorize('admin'), bookingIdValidation, getBooking);
router.put('/:id', authorize('admin'), bookingIdValidation, updateBooking);
router.put('/:id/cancel', authorize('admin'), bookingIdValidation, cancelBooking);

export default router;