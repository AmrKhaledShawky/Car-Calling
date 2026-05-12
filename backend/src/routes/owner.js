import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createCar,
  deleteCar,
  getMyCars,
  updateCar
} from '../controllers/carController.js';
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  getOwnerBookings
} from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/auth.js';
import {
  validateBookingOwner,
  validateBookingOwnership,
  validateCarOwnership
} from '../middleware/ownership.middleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { createOwnerCarValidation } from '../validators/car.validators.js';

const router = express.Router();

const carValidation = createOwnerCarValidation();

const carIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid car ID')
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

const validateCarDetails = validateRequest('Please fix the highlighted car details and try again.');
const validateOwnerRequest = validateRequest();

router.use(protect);
router.use(authorize('owner'));

router.route('/cars')
  .get(getMyCars)
  .post(uploadSingle('image'), carValidation, validateCarDetails, createCar);

router.route('/cars/:id')
  .put(uploadSingle('image'), carIdValidation, validateOwnerRequest, validateCarOwnership, updateCar)
  .delete(carIdValidation, validateOwnerRequest, validateCarOwnership, deleteCar);

router.get('/bookings', bookingListValidation, validateOwnerRequest, getOwnerBookings);
router.put('/bookings/:id/confirm', bookingIdValidation, validateOwnerRequest, validateBookingOwner, confirmBooking);
router.put('/bookings/:id/complete', bookingIdValidation, validateOwnerRequest, validateBookingOwner, completeBooking);
router.put('/bookings/:id/cancel', cancelBookingValidation, validateOwnerRequest, validateBookingOwnership, cancelBooking);

export default router;
