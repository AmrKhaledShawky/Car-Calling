import User from '../../models/User.js';

const safe = '-password -refreshToken';

export const getAllUsers = async (query) => {
  const filter = {};
  if (query.role) filter.role = query.role;

  return await User.find(filter).select(safe);
};

export const createAdminUser = async (body) => {
  const exists = await User.findOne({ email: body.email });
  if (exists) throw new Error('User exists');

  return await User.create(body);
};

export const updateAdminUser = async (id, body, admin) => {
  if (admin._id.toString() === id && body.role !== 'admin') {
    throw new Error('Cannot remove own admin role');
  }

  return await User.findByIdAndUpdate(id, body, { new: true });
};

export const deleteAdminUser = async (id, admin) => {
  if (admin._id.toString() === id) {
    throw new Error('Cannot delete self');
  }

  return await User.findByIdAndDelete(id);
};