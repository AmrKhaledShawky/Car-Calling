import Car from '../../models/Car.js';
import Booking from '../../models/Booking.js';

export const createCar = async (data) => {
  return await Car.create(data);
};

export const updateCar = async (id, data) => {
  return await Car.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCar = async (id) => {
  const active = await Booking.find({
    car: id,
    status: { $in: ['active', 'confirmed'] }
  });

  if (active.length) {
    throw new Error('Car has active bookings');
  }

  return await Car.findByIdAndDelete(id);
};