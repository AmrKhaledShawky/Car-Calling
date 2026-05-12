import express from 'express';
import { param } from 'express-validator';
import {
  getAvailableCars,
  getCar,
  getCars,
  searchCars
} from '../controllers/carController.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

const carIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid car ID')
];

const validatePublicRequest = validateRequest();

router.get('/cars', getCars);
router.get('/cars/available', getAvailableCars);
router.get('/cars/search', searchCars);
router.get('/cars/:id', carIdValidation, validatePublicRequest, getCar);

export default router;
