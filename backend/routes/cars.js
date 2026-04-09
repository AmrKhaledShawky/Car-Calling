import express from 'express';
import { body, param, query } from 'express-validator';
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
import { protect, authorize, ownerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const carValidation = [
  body('make')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Make is required and must be less than 50 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model is required and must be less than 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid year'),
  body('vin')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('Please provide a valid 17-character VIN'),
  body('licensePlate')
    .trim()
    .notEmpty()
    .withMessage('License plate is required'),
  body('category')
    .isIn(['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'luxury', 'sports'])
    .withMessage('Please provide a valid category'),
  body('fuelType')
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in hybrid'])
    .withMessage('Please provide a valid fuel type'),
  body('transmission')
    .isIn(['manual', 'automatic', 'cvt', 'dct'])
    .withMessage('Please provide a valid transmission type'),
  body('seats')
    .isInt({ min: 1, max: 9 })
    .withMessage('Seats must be between 1 and 9'),
  body('doors')
    .isInt({ min: 2, max: 5 })
    .withMessage('Doors must be between 2 and 5'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required'),
  body('mileage')
    .isFloat({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('dailyRate')
    .isFloat({ min: 0 })
    .withMessage('Daily rate must be a positive number'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
];

const carIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid car ID')
];

// Public routes
router.get('/', getCars);
router.get('/available', getAvailableCars);
router.get('/search', searchCars);
router.get('/:id', carIdValidation, getCar);

// Protected routes (require authentication)
router.use(protect);

// Landlord/Owner routes
router.get('/owner/my-cars', authorize('landlord'), getMyCars);
router.post('/', authorize('landlord'), carValidation, createCar);
router.put('/:id', authorize('landlord'), carIdValidation, ownerOrAdmin, updateCar);
router.delete('/:id', authorize('landlord'), carIdValidation, ownerOrAdmin, deleteCar);

export default router;