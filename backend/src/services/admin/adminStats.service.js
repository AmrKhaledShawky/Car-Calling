import User from '../../models/User.js';
import Car from '../../models/Car.js';
import Booking from '../../models/Booking.js';

export const getDashboardStats = async () => {
  const [users, cars, bookings] = await Promise.all([
    User.find().select('role createdAt').lean(),
    Car.find().select('isAvailable status createdAt').lean(),
    Booking.find().populate('car customer owner').sort({ createdAt: -1 }).lean()
  ]);

  const totalRevenue = bookings
    .filter((booking) => ['confirmed', 'active', 'completed'].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  
  const totalCarsAvailable = cars.filter((car) => car.isAvailable && car.status === 'available').length;
  const totalCarsRented = cars.filter((car) => ['rented', 'active'].includes(car.status)).length;
  
  const overdueBookings = bookings.filter((booking) => (
    ['confirmed', 'active'].includes(booking.status)
    && booking.endDate
    && new Date(booking.endDate) < new Date()
  )).length;

  const cost = totalRevenue * 0.35;
  const profit = totalRevenue - cost;

  return {
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCars: cars.length,
      totalUsers: users.length,
      totalLandlords: users.filter((user) => user.role === 'landlord').length,
      totalCarsAvailable,
      totalCarsRented,
      overdueBookings
    },
    users,
    bookings,
    profitData: [
      { name: 'Revenue', value: Math.round(totalRevenue * 100) / 100 },
      { name: 'Cost', value: Math.round(cost * 100) / 100 },
      { name: 'Profit', value: Math.round(profit * 100) / 100 }
    ]
  };
};