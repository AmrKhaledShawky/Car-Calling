import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllBookings,
  getAllCars,
  updateUserStatus,
  updateCarStatus,
  getRevenueStats,
  getSystemLogs,
  getAdminProfile,
  updateAdminProfile,
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  getLandlords,
  createCarAdmin,
  updateCarAdmin,
  deleteCarAdmin

} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { createAdminCarValidation } from '../validators/car.validators.js';

const router = express.Router();
const adminCarValidation = createAdminCarValidation();
const validateCarDetails = validateRequest('Please fix the highlighted car details and try again.');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueStats);

// User management
router.route('/users')
  .get(getAllUsers)
  .post(createAdminUser);
router.put('/users/:id/status', updateUserStatus);
router.route('/users/:id')
  .get(getAdminUserById)
  .put(updateAdminUser)
  .delete(deleteAdminUser);

// Landlord management
router.get('/landlords', getLandlords);

// Car management
router.get('/cars', getAllCars);
router.post('/cars', uploadSingle('image'), adminCarValidation, validateCarDetails, createCarAdmin);
router.put('/cars/:id', uploadSingle('image'), updateCarAdmin);
router.put('/cars/:id/status', updateCarStatus);
router.delete('/cars/:id', deleteCarAdmin);

// Booking management
router.get('/bookings', getAllBookings);

// Passenger management
router.route('/passengers')
  .get(getAllPassengers)
  .post(createPassenger);

router.route('/passengers/:id')
  .get(getPassengerById)
  .put(updatePassenger)
  .delete(deletePassenger);

// Profile routes
router.route('/profile').get(getAdminProfile).put(updateAdminProfile);


// System routes
router.get('/logs', getSystemLogs);

export default router;
