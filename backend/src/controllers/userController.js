import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/user/user.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const data = await userService.getUsers(req.query);

  res.status(200).json({
    success: true,
    data
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const data = await userService.getUser(req.params.id);

  res.status(200).json({
    success: true,
    data
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const data = await userService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const data = await userService.getUserStats();

  res.status(200).json({
    success: true,
    data
  });
});

