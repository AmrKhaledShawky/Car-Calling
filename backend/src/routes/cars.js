import express from 'express';
import { param } from 'express-validator';
import {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getMyCars,
  getAvailableCars,
  searchCars
} from '../controllers/carController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCarOwnership } from '../middleware/ownership.middleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { createOwnerCarValidation } from '../validators/car.validators.js';

const router = express.Router();

// Validation rules
const carValidation = createOwnerCarValidation();

const carIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid car ID')
];

const validateCarDetails = validateRequest('Please fix the highlighted car details and try again.');
const validateCarRequest = validateRequest();

// Public routes
router.get('/', getCars);
router.get('/available', getAvailableCars);
router.get('/search', searchCars);
router.get('/owner/my-cars', protect, authorize('landlord'), getMyCars);
router.get('/:id', carIdValidation, validateCarRequest, getCar);

// Protected routes (require authentication)
router.use(protect);

// Landlord/Owner routes
router.post('/', uploadSingle('image'), authorize('landlord'), carValidation, validateCarDetails, createCar);
router.put('/:id', uploadSingle('image'), authorize('owner', 'admin'), carIdValidation, validateCarRequest, validateCarOwnership, updateCar);
router.delete('/:id', authorize('owner', 'admin'), carIdValidation, validateCarRequest, validateCarOwnership, deleteCar);

export default router;
