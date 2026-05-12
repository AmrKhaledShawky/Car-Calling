import Car from '../../models/Car.js';
import Booking from '../../models/Booking.js';

const getUserId = (user) => user?.id || user?._id?.toString();

export const createCar = async ({ body, user }) => {
  const car = await Car.create({
    ...body,
    owner: getUserId(user)
  });

  return {
    data: car,
    message: 'Car created successfully',
    statusCode: 201
  };
};

export const updateCar = async ({ id, body, car: ownedCar = null }) => {
  const car = ownedCar || await Car.findById(id);

  if (!car) {
    throw new Error('Car not found');
  }

  const updated = await Car.findByIdAndUpdate(id, body, {
    new: true
  });

  return {
    data: updated,
    message: 'Car updated successfully'
  };
};

export const deleteCar = async ({ id, user }) => {
  const car = await Car.findById(id);

  if (!car) {
    throw new Error('Car not found');
  }

  const activeBookings = await Booking.find({
    car: id,
    status: { $in: ['confirmed', 'active'] }
  });

  if (activeBookings.length > 0) {
    throw new Error('Car has active bookings');
  }

  await Car.findByIdAndDelete(id);

  return {
    message: 'Car deleted successfully'
  };
};
