import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
import Car from '../../models/Car.js';

const blockingStatuses = ['pending', 'confirmed', 'active'];

export const deactivate = async (userReq, body) => {
  const user = await User.findById(userReq._id).select('+password');

  const match = await user.comparePassword(body.currentPassword);
  if (!match) throw new Error('Wrong password');

  const bookings = await Booking.find({
    $or: [{ customer: user._id }, { owner: user._id }],
    status: { $in: blockingStatuses }
  });

  if (bookings.length) {
    throw new Error('Active bookings exist');
  }

  user.isActive = false;
  user.refreshToken = undefined;
  await user.save();

  return { message: 'Account deactivated' };
};

export const remove = async (userReq, body) => {
  const user = await User.findById(userReq._id).select('+password');

  const match = await user.comparePassword(body.currentPassword);
  if (!match) throw new Error('Wrong password');

  const bookings = await Booking.find({
    $or: [{ customer: user._id }, { owner: user._id }],
    status: { $in: blockingStatuses }
  });

  if (bookings.length) {
    throw new Error('Active bookings exist');
  }

  await Booking.deleteMany({
    $or: [{ customer: user._id }, { owner: user._id }]
  });

  await Car.deleteMany({ owner: user._id });

  await User.findByIdAndDelete(user._id);

  return { message: 'Account deleted' };
};