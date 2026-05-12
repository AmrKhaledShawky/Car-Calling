import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth/auth.service.js';
import User from '../models/User.js';

const buildAuthPayload = ({ user, token, refreshToken }) => ({
  success: true,
  data: { user },
  token,
  refreshToken
});

const safeUserFields = '-password -refreshToken';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json(buildAuthPayload(data));
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json(buildAuthPayload(data));
});

export const logout = asyncHandler(async (req, res) => {
  const data = await authService.logout(req.user);
  res.status(200).json({ success: true, ...data });
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.user, req.body);
  res.status(200).json({ success: true, ...data });
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  const data = await authService.deactivateAccount(req.user, req.body);
  res.status(200).json({ success: true, ...data });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const data = await authService.deleteAccount(req.user, req.body);
  res.status(200).json({ success: true, ...data });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(safeUserFields);
  res.status(200).json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatar', 'address', 'dateOfBirth', 'gender', 'licenseNumber', 'businessName'];
  const updates = allowedFields.reduce((payload, field) => {
    if (req.body[field] !== undefined) {
      payload[field] = req.body[field];
    }

    return payload;
  }, {});

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).select(safeUserFields);

  res.status(200).json({ success: true, data: { user }, message: 'Profile updated successfully' });
});
export const forgotPassword = asyncHandler(async (req, res) => { res.status(200).json({ success: true, message: 'Not implemented' }); });
export const resetPassword = asyncHandler(async (req, res) => { res.status(200).json({ success: true, message: 'Not implemented' }); });
export const refreshToken = asyncHandler(async (req, res) => { res.status(200).json({ success: true, message: 'Not implemented' }); });
export const verifyEmail = asyncHandler(async (req, res) => { res.status(200).json({ success: true, message: 'Not implemented' }); });
