import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'landlord'])
    .withMessage('Role must be either user or landlord')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const accountActionValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateAuthRequest = validateRequest();

// Public routes
router.post('/register', registerValidation, validateAuthRequest, register);
router.post('/login', loginValidation, validateAuthRequest, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validateAuthRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateAuthRequest, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidation, validateAuthRequest, changePassword);
router.put('/account/deactivate', accountActionValidation, validateAuthRequest, deactivateAccount);
router.delete('/account', accountActionValidation, validateAuthRequest, deleteAccount);
router.post('/logout', logout);

export default router;
