import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
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

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Landlord management
router.get('/landlords', getLandlords);

// Car management
router.get('/cars', getAllCars);
router.post('/cars', createCarAdmin);
router.put('/cars/:id', updateCarAdmin);
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
