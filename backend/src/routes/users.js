import express from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid user ID')
];

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/stats', authorize('admin'), getUserStats);
router.get('/:id', authorize('admin'), userIdValidation, getUser);
router.put('/:id', authorize('admin'), userIdValidation, updateUser);
router.delete('/:id', authorize('admin'), userIdValidation, deleteUser);

export default router;