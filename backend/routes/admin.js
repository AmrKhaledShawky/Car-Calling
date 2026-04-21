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
  updateAdminProfile
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

// Car management
router.get('/cars', getAllCars);
router.put('/cars/:id/status', updateCarStatus);

// Booking management
router.get('/bookings', getAllBookings);

// Profile routes
router.route('/profile').get(getAdminProfile).put(updateAdminProfile);

// System routes
router.get('/logs', getSystemLogs);

export default router;
