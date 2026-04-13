import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

const roundCurrency = (value) => Math.round((value || 0) * 100) / 100;

const getLastSixMonths = () => {
  const months = [];
  const currentDate = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - offset, 1);
    months.push({
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: monthDate.toLocaleString('en-US', { month: 'short' }),
      year: monthDate.getFullYear(),
      month: monthDate.getMonth()
    });
  }

  return months;
};

const buildMonthlyRevenueSeries = (bookings = [], users = []) => {
  const months = getLastSixMonths();

  return months.map(({ key, label, year, month }) => {
    const monthlyBookings = bookings.filter((booking) => {
      const bookingDate = booking.createdAt ? new Date(booking.createdAt) : null;
      return bookingDate && bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
    });

    const monthlyUsers = users.filter((user) => {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null;
      return createdAt && createdAt.getFullYear() === year && createdAt.getMonth() === month;
    });

    const revenue = monthlyBookings
      .filter((booking) => ['confirmed', 'active', 'completed'].includes(booking.status))
      .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);

    const refunds = monthlyBookings
      .filter((booking) => booking.status === 'cancelled')
      .reduce((sum, booking) => sum + Number(booking.cancellationFee || 0), 0);

    const overdue = monthlyBookings.filter((booking) => {
      const endDate = booking.endDate ? new Date(booking.endDate) : null;
      return endDate && endDate < new Date() && ['confirmed', 'active'].includes(booking.status);
    }).length;

    return {
      month: label,
      revenue: roundCurrency(revenue),
      cost: roundCurrency(refunds),
      overdue,
      users: monthlyUsers.length,
      bookings: monthlyBookings.length,
      key
    };
  });
};

export const getDashboardStats = async (req, res) => {
  try {
    const [users, cars, bookings] = await Promise.all([
      User.find().select('role isActive createdAt'),
      Car.find().select('status isAvailable createdAt dailyRate'),
      Booking.find()
        .populate('customer', 'name email')
        .populate('car', 'make model year')
        .select('customer car totalAmount status startDate endDate createdAt')
    ]);

    const monthlyData = buildMonthlyRevenueSeries(bookings, users);
    const totalRevenue = bookings
      .filter((booking) => ['confirmed', 'active', 'completed'].includes(booking.status))
      .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
    const totalCost = bookings
      .filter((booking) => booking.status === 'cancelled')
      .reduce((sum, booking) => sum + Number(booking.cancellationFee || 0), 0);

    const recentBookings = bookings
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 8)
      .map((booking) => ({
        id: booking._id,
        customer: booking.customer?.name || booking.customer?.email || 'Unknown customer',
        car: `${booking.car?.year || ''} ${booking.car?.make || ''} ${booking.car?.model || ''}`.trim() || 'Unknown car',
        totalAmount: booking.totalAmount || 0,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        status: booking.status
      }));

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue: roundCurrency(totalRevenue),
          totalCars: cars.length,
          totalUsers: users.filter((user) => user.role === 'user').length,
          totalLandlords: users.filter((user) => user.role === 'landlord').length,
          totalCarsAvailable: cars.filter((car) => car.status === 'available' && car.isAvailable).length,
          totalCarsRented: cars.filter((car) => car.status === 'rented').length,
          overdueBookings: bookings.filter((booking) => ['confirmed', 'active'].includes(booking.status) && new Date(booking.endDate) < new Date()).length,
          totalBookings: bookings.length
        },
        monthlyData,
        profitData: [
          { name: 'Revenue', value: roundCurrency(totalRevenue) },
          { name: 'Cost', value: roundCurrency(totalCost) },
          { name: 'Profit', value: roundCurrency(totalRevenue - totalCost) }
        ],
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 });

    const [customerBookings, ownedCars] = await Promise.all([
      Booking.find().select('customer createdAt'),
      Car.find().select('owner make model year createdAt')
    ]);

    const data = users.map((user) => {
      const userBookings = customerBookings.filter((booking) => booking.customer?.toString() === user._id.toString());
      const userCars = ownedCars.filter((car) => car.owner?.toString() === user._id.toString());
      const lastCar = userCars.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
      const lastBooking = userBookings.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];

      return {
        ...user.toObject({ virtuals: true }),
        bookingCount: userBookings.length,
        carCount: userCars.length,
        lastCar: lastCar ? { model: `${lastCar.make} ${lastCar.model}`, year: lastCar.year } : null,
        lastBookingDate: lastBooking?.createdAt || null
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load users',
      error: error.message
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('car', 'make model year location paymentStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load bookings',
      error: error.message
    });
  }
};

export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate('owner', 'name email phone isActive')
      .sort({ createdAt: -1 });

    const bookings = await Booking.find().select('car status');

    const data = cars.map((car) => ({
      ...car.toObject({ virtuals: true }),
      bookingCount: bookings.filter((booking) => booking.car?.toString() === car._id.toString()).length
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load cars',
      error: error.message
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(req.body.isActive) },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const nextStatus = req.body.status;
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        status: nextStatus,
        isAvailable: nextStatus === 'available'
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update car status',
      error: error.message
    });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const [bookings, users] = await Promise.all([
      Booking.find().select('totalAmount cancellationFee status createdAt endDate'),
      User.find().select('createdAt')
    ]);

    res.status(200).json({
      success: true,
      data: buildMonthlyRevenueSeries(bookings, users)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load revenue stats',
      error: error.message
    });
  }
};

export const getSystemLogs = async (req, res) => {
  res.status(200).json({
    success: true,
    data: []
  });
};
