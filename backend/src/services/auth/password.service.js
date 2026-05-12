import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

export const compare = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const changePassword = async (userReq, body) => {
  const user = await User.findById(userReq._id).select('+password');

  const match = await bcrypt.compare(body.currentPassword, user.password);
  if (!match) throw new Error('Wrong current password');

  user.password = body.newPassword;
  await user.save();

  return { message: 'Password changed' };
};