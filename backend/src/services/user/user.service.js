import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
import Car from '../../models/Car.js';

const normalizeUserUpdatePayload = (payload = {}) => {
  const normalized = { ...payload };
  const address = { ...(payload.address || {}) };

  if (payload.location !== undefined) {
    address.street = payload.location;
  }

  if (payload.city !== undefined) {
    address.city = payload.city;
  }

  if (payload.country !== undefined) {
    address.country = payload.country;
  }

  delete normalized.location;
  delete normalized.city;
  delete normalized.country;

  if (!normalized.password) {
    delete normalized.password;
  }

  if (Object.keys(address).length > 0) {
    normalized.address = address;
  }

  return normalized;
};

export const getUsers = async (query) => {
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });

  return users;
};

export const getUser = async (id) => {
  const user = await User.findById(id).select('-password -refreshToken');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUser = async (id, data) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  Object.assign(user, normalizeUserUpdatePayload(data));
  await user.save();

  return User.findById(id).select('-password -refreshToken');
};

export const deleteUser = async (id) => {
  const activeBooking = await Booking.exists({
    $or: [{ customer: id }, { owner: id }],
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  if (activeBooking) {
    throw new Error('Cannot delete a user with pending, confirmed, or active bookings');
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error('User not found');
  }

  await Promise.all([
    Booking.deleteMany({ $or: [{ customer: user._id }, { owner: user._id }] }),
    Car.deleteMany({ owner: user._id })
  ]);

  return { id: user._id };
};

export const getUserStats = async () => {
  const [users, bookings, cars] = await Promise.all([
    User.countDocuments(),
    Booking.countDocuments(),
    Car.countDocuments()
  ]);

  return {
    users,
    bookings,
    cars
  };
};
