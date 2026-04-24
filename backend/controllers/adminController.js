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
    console.log('[Admin] getAllBookings called by user:', req.user?._id, 'role:', req.user?.role);

    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('owner', 'name email phone avatar')
      .populate('car', 'make model year images dailyRate location status vin licensePlate')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[Admin] getAllBookings returned ${bookings.length} bookings`);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('[Admin] getAllBookings error:', error);
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
      .populate('owner', 'name email phone')
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

export const getAllPassengers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 });

    const customerBookings = await Booking.find().select('customer createdAt');

    const data = users.map((user) => {
      const userBookings = customerBookings.filter(
        (booking) => booking.customer?.toString() === user._id.toString()
      );
      const lastBooking = userBookings.sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
      )[0];

      return {
        _id: user._id,
        id: user._id,
        profile: user.avatar || '',
        avatar: user.avatar || '',
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        trips: userBookings.length,
        bookingCount: userBookings.length,
        lastTrip: lastBooking?.createdAt || null,
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
      message: 'Failed to load passengers',
      error: error.message
    });
  }
};

export const getPassengerById = async (req, res) => {
  try {
    const passenger = await User.findOne({
      _id: req.params.id,
      role: 'user'
    }).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: passenger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load passenger',
      error: error.message
    });
  }
};

export const createPassenger = async (req, res) => {
  try {
    const { name, email, phone, location, password, city, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const passengerData = {
      name,
      email,
      phone,
      password,
      role: 'user',
      isActive: true,
      address: {
        street: location || '',
        city: city || '',
        country: country || 'USA'
      }
    };

    const passenger = await User.create(passengerData);

    const populatedPassenger = await User.findById(passenger._id)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Passenger created successfully',
      data: populatedPassenger
    });
  } catch (error) {
    console.error('Create passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create passenger',
      error: error.message
    });
  }
};

export const updatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const passenger = await User.findOne({ _id: id, role: 'user' });
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }

    if (!updates.password) {
      delete updates.password;
    }

    if (updates.location !== undefined) {
      updates.address = updates.address || {};
      updates.address.street = updates.location;
      delete updates.location;
    }
    if (updates.city !== undefined) {
      updates.address = updates.address || {};
      updates.address.city = updates.city;
      delete updates.city;
    }
    if (updates.country !== undefined) {
      updates.address = updates.address || {};
      updates.address.country = updates.country;
      delete updates.country;
    }

    const updatedPassenger = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    res.status(200).json({
      success: true,
      message: 'Passenger updated successfully',
      data: updatedPassenger
    });
  } catch (error) {
    console.error('Update passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update passenger',
      error: error.message
    });
  }
};

export const deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;

    const passenger = await User.findOneAndDelete({ _id: id, role: 'user' });
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Passenger deleted successfully',
      data: { id: passenger._id }
    });
  } catch (error) {
    console.error('Delete passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete passenger',
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
export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    console.log('Update body:', req.body);
    console.log('User ID:', req.user._id);
    
    const updates = {};
    const allowedFields = ['name', 'phone', 'title', 'language'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (req.body.password) {
      updates.password = req.body.password;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }
    
    Object.assign(user, updates);
    await user.save();
    
    const updatedUser = await User.findById(req.user._id).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('UpdateAdminProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile',
      error: error.message
    });
  }
};

export const getLandlords = async (req, res) => {
  try {
    const landlords = await User.find({ role: 'landlord' })
      .select('_id name email phone avatar')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: landlords.length,
      data: landlords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load landlords',
      error: error.message
    });
  }
};

export const createCarAdmin = async (req, res) => {
  try {
    const {
      make, model, year, vin, licensePlate, category, fuelType,
      transmission, seats, doors, color, mileage, dailyRate,
      weeklyRate, monthlyRate, location, owner, notes, status
    } = req.body;

    if (!make || !model || !year || !vin || !category || !fuelType || !transmission || !seats || !dailyRate || !location?.city || !owner) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: make, model, year, vin, category, fuelType, transmission, seats, dailyRate, location.city, owner'
      });
    }

    const carData = {
      make,
      model,
      year: Number(year),
      vin: vin.toUpperCase(),
      licensePlate: licensePlate ? licensePlate.toUpperCase().trim() : undefined,
      category: category.toLowerCase(),
      fuelType: fuelType.toLowerCase(),
      transmission: transmission.toLowerCase(),
      seats: Number(seats),
      doors: doors ? Number(doors) : 4,
      color: color || 'Unknown',
      mileage: mileage !== undefined ? Number(mileage) : 0,
      dailyRate: Number(dailyRate),
      weeklyRate: weeklyRate ? Number(weeklyRate) : undefined,
      monthlyRate: monthlyRate ? Number(monthlyRate) : undefined,
      location: {
        address: location?.address || '',
        city: location.city,
        state: location?.state || '',
        zipCode: location?.zipCode || '',
        coordinates: location?.coordinates
      },
      owner,
      isAvailable: status === 'available' || !status,
      status: status || 'available',
      notes: notes || ''
    };

    const car = await Car.create(carData);

    const populatedCar = await Car.findById(car._id)
      .populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: populatedCar
    });
  } catch (error) {
    console.error('Create car admin error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Some car details still need attention.',
        errors: Object.entries(error.errors).map(([field, value]) => ({
          field,
          message: value.message
        }))
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      const fieldLabels = {
        vin: 'VIN',
        licensePlate: 'license plate'
      };

      return res.status(400).json({
        success: false,
        message: `This ${fieldLabels[duplicateField] || duplicateField} is already in use.`,
        errors: duplicateField
          ? [{ field: duplicateField, message: `This ${fieldLabels[duplicateField] || duplicateField} already exists.` }]
          : []
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create car',
      error: error.message
    });
  }
};

export const updateCarAdmin = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const updates = { ...req.body };

    if (updates.vin) updates.vin = updates.vin.toUpperCase();
    if (updates.licensePlate) updates.licensePlate = updates.licensePlate.toUpperCase().trim();
    if (updates.category) updates.category = updates.category.toLowerCase();
    if (updates.fuelType) updates.fuelType = updates.fuelType.toLowerCase();
    if (updates.transmission) updates.transmission = updates.transmission.toLowerCase();
    if (updates.seats) updates.seats = Number(updates.seats);
    if (updates.doors) updates.doors = Number(updates.doors);
    if (updates.mileage !== undefined) updates.mileage = Number(updates.mileage);
    if (updates.dailyRate) updates.dailyRate = Number(updates.dailyRate);
    if (updates.weeklyRate) updates.weeklyRate = Number(updates.weeklyRate);
    if (updates.monthlyRate) updates.monthlyRate = Number(updates.monthlyRate);

    updates.licensePlate = updates.licensePlate || undefined;
    updates.color = updates.color || 'Unknown';
    updates.doors = updates.doors ?? 4;
    updates.mileage = updates.mileage ?? 0;

    if (updates.status) {
      updates.isAvailable = updates.status === 'available';
    }

    if (updates.location) {
      updates.location = {
        address: updates.location?.address || '',
        city: updates.location?.city || car.location?.city,
        state: updates.location?.state || '',
        zipCode: updates.location?.zipCode || '',
        coordinates: updates.location?.coordinates || car.location?.coordinates
      };
    }

    car = await Car.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    console.error('Update car admin error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Some car details still need attention.',
        errors: Object.entries(error.errors).map(([field, value]) => ({
          field,
          message: value.message
        }))
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      const fieldLabels = {
        vin: 'VIN',
        licensePlate: 'license plate'
      };

      return res.status(400).json({
        success: false,
        message: `This ${fieldLabels[duplicateField] || duplicateField} is already in use.`,
        errors: duplicateField
          ? [{ field: duplicateField, message: `This ${fieldLabels[duplicateField] || duplicateField} already exists.` }]
          : []
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update car',
      error: error.message
    });
  }
};

export const deleteCarAdmin = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const activeBookings = await Booking.find({
      car: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete car with active bookings'
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Delete car admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car',
      error: error.message
    });
  }
};
