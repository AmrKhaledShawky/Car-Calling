import * as tokenService from './token.service.js';
import * as passwordService from './password.service.js';
import * as accountService from './account.service.js';
import User from '../../models/User.js';
import ApiError from '../../utils/ApiError.js';

export const register = async (body = {}) => {
  const { name, email, password, role } = body;
  
  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide all required fields (name, email, password)');
  }

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, 'User already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });

  return tokenService.createAuthResponse(user);
};

export const login = async (body) => {
  const user = await User.findOne({ email: body.email }).select('+password');

  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(401, 'Account deactivated');

  const ok = await passwordService.compare(body.password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  return tokenService.createAuthResponse(user);
};

export const logout = async (user) => {
  user.refreshToken = undefined;
  await user.save();
  return { message: 'Logged out' };
};

export const changePassword = async (userReq, body) => {
  return passwordService.changePassword(userReq, body);
};

export const deactivateAccount = async (userReq, body) => {
  return accountService.deactivate(userReq, body);
};

export const deleteAccount = async (userReq, body) => {
  return accountService.remove(userReq, body);
};
