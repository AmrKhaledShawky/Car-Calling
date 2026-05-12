import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import * as adminStatsService from '../services/admin/adminStats.service.js';
import * as authService from '../services/auth/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/env.config.js';

const SAFE_USER_FIELDS = '-password -refreshToken';

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => res.status(statusCode).json({
  success: true,
  message,
  data,
  ...(meta || {})
});

const getId = (value) => value?._id?.toString() || value?.id?.toString() || value?.toString();

const buildCarName = (car) => [car?.year, car?.make, car?.model].filter(Boolean).join(' ') || 'Unknown car';

const getActiveBookingFilter = () => ({
  status: { $in: ['confirmed', 'active'] }
});

const getAbsoluteUrl = (path) => {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${config.serverUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const formatCarImages = (car) => {
  if (!car) return car;
  
  const carObj = car.toObject ? car.toObject({ virtuals: true }) : car;
  
  // Format all images in the array
  if (Array.isArray(carObj.images)) {
    carObj.images = carObj.images.map(img => {
      if (img && img.url) {
        return {
          ...img,
          url: getAbsoluteUrl(img.url)
        };
      }
      return img;
    });
  }
  
  // Format primary image if it exists
  if (carObj.primaryImage && carObj.primaryImage.url) {
    // Create a copy to avoid mutating the virtual result directly
    carObj.primaryImage = {
      ...carObj.primaryImage,
      url: getAbsoluteUrl(carObj.primaryImage.url)
    };
  }
  
  return carObj;
};

const normalizeTextOption = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : value
);

const getUploadedImageUrl = (file) => {
  if (!file) return '';
  if (file.buffer && file.mimetype) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
  if (file.filename) return `uploads/${file.filename}`;
  if (file.path) return file.path.replace(/\\/g, '/');

  return '';
};

const normalizeAdminCarPayload = (payload = {}, existingCar = null) => {
  const status = normalizeTextOption(payload.status) || existingCar?.status || 'available';
  const normalized = {
    ...payload,
    status,
    vin: typeof payload.vin === 'string' ? payload.vin.trim().toUpperCase() : payload.vin,
    licensePlate: typeof payload.licensePlate === 'string' ? payload.licensePlate.trim().toUpperCase() || undefined : undefined,
    category: normalizeTextOption(payload.category),
    fuelType: normalizeTextOption(payload.fuelType),
    transmission: normalizeTextOption(payload.transmission),
    color: payload.color || existingCar?.color || 'Unknown',
    mileage: payload.mileage ?? existingCar?.mileage ?? 0,
    doors: payload.doors ?? existingCar?.doors ?? 4,
    isAvailable: status === 'available',
    location: {
      address: payload.location?.address || payload['location[address]'] || existingCar?.location?.address || '',
      city: payload.location?.city || payload['location[city]'] || existingCar?.location?.city,
      state: payload.location?.state || payload['location[state]'] || existingCar?.location?.state || '',
      zipCode: payload.location?.zipCode || payload['location[zipCode]'] || existingCar?.location?.zipCode || '',
      coordinates: payload.location?.coordinates || payload['location[coordinates]'] || existingCar?.location?.coordinates
    }
  };

  if (payload['features[]']) {
    normalized.features = Array.isArray(payload['features[]']) ? payload['features[]'] : [payload['features[]']];
  }

  return normalized;
};

const normalizeAdminUserPayload = (payload = {}) => {
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

const canDeleteCar = async (id) => {
  const activeBooking = await Booking.exists({
    car: id,
    ...getActiveBookingFilter()
  });

  if (activeBooking) {
    throw new ApiError(400, 'Car has active bookings');
  }
};

const getUsersWithUsage = async (filter = {}) => {
  const users = await User.find(filter).select(SAFE_USER_FIELDS).sort({ createdAt: -1 }).lean();

  const usage = await Promise.all(users.map(async (user) => {
    const [bookingCount, carCount, lastCar] = await Promise.all([
      Booking.countDocuments({ customer: user._id }),
      Car.countDocuments({ owner: user._id }),
      Car.findOne({ owner: user._id }).sort({ createdAt: -1 }).select('make model year').lean()
    ]);

    return {
      ...user,
      bookingCount,
      carCount,
      lastCar
    };
  }));

  return usage;
};

const getCarsWithUsage = async (filter = {}) => {
  const cars = await Car.find(filter)
    .populate('owner', 'name email avatar phone')
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  return Promise.all(cars.map(async (car) => ({
    ...formatCarImages(car),
    bookingCount: await Booking.countDocuments({ car: car._id })
  })));
};

const getBookings = (filter = {}) => Booking.find(filter)
  .populate('car customer owner')
  .sort({ createdAt: -1 });

const buildMonthlyData = (users, bookings) => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), index, 1);
    const month = monthDate.toLocaleString('en', { month: 'short' });
    const monthlyBookings = bookings.filter((booking) => {
      const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
      return createdAt && createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === index;
    });

    const revenue = monthlyBookings
      .filter((booking) => ['confirmed', 'active', 'completed'].includes(booking.status))
      .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);

    return {
      month,
      revenue: Math.round(revenue * 100) / 100,
      cost: Math.round(revenue * 35) / 100,
      overdue: monthlyBookings.filter((booking) => (
        ['confirmed', 'active'].includes(booking.status)
        && booking.endDate
        && new Date(booking.endDate) < new Date()
      )).length,
      users: users.filter((user) => {
        const createdAt = user.createdAt ? new Date(user.createdAt) : null;
        return createdAt && createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === index;
      }).length
    };
  });
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(result.statusCode).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(result.statusCode).json(result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user);
  res.status(result.statusCode).json(result);
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user, req.body);
  res.status(result.statusCode).json(result);
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  const result = await authService.deactivateAccount(req.user, req.body);
  res.status(result.statusCode).json(result);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteAccount(req.user, req.body);
  res.status(result.statusCode).json(result);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminStatsService.getDashboardStats();

  return sendSuccess(res, {
    kpis: stats.kpis,
    monthlyData: buildMonthlyData(stats.users, stats.bookings),
    profitData: stats.profitData,
    recentBookings: stats.bookings.slice(0, 8).map((booking) => ({
      id: booking._id,
      customer: booking.customer?.name || booking.customer?.email || 'Unknown customer',
      car: buildCarName(booking.car),
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt,
      status: booking.status
    }))
  }, 'Dashboard statistics fetched successfully');
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  return sendSuccess(res, await getUsersWithUsage(filter), 'Users fetched successfully');
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS);
  if (!user) throw new ApiError(404, 'User not found');
  return sendSuccess(res, user, 'User fetched successfully');
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const payload = normalizeAdminUserPayload(req.body);
  const exists = await User.exists({ email: payload.email });
  if (exists) throw new ApiError(400, 'User exists');

  const user = await User.create(payload);
  const safeUser = await User.findById(user._id).select(SAFE_USER_FIELDS);
  return sendSuccess(res, safeUser, 'User created successfully', 201);
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const payload = normalizeAdminUserPayload(req.body);

  if (getId(req.user) === req.params.id && payload.role && payload.role !== 'admin') {
    throw new ApiError(400, 'Cannot remove own admin role');
  }

  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  Object.assign(user, payload);
  await user.save();

  const safeUser = await User.findById(user._id).select(SAFE_USER_FIELDS);
  return sendSuccess(res, safeUser, 'User updated successfully');
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  if (getId(req.user) === req.params.id) {
    throw new ApiError(400, 'Cannot delete self');
  }

  const activeBooking = await Booking.exists({
    $or: [{ customer: req.params.id }, { owner: req.params.id }],
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  if (activeBooking) {
    throw new ApiError(400, 'Cannot delete a user with pending, confirmed, or active bookings');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  await Promise.all([
    Booking.deleteMany({ $or: [{ customer: user._id }, { owner: user._id }] }),
    Car.deleteMany({ owner: user._id })
  ]);

  return sendSuccess(res, { id: user._id }, 'User deleted successfully');
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  if (getId(req.user) === req.params.id) {
    throw new ApiError(400, 'Cannot update own status');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(req.body.isActive) },
    { new: true, runValidators: true }
  ).select(SAFE_USER_FIELDS);

  if (!user) throw new ApiError(404, 'User not found');
  return sendSuccess(res, user, 'User status updated successfully');
});

export const getLandlords = asyncHandler(async (req, res) => {
  return sendSuccess(res, await getUsersWithUsage({ role: 'landlord' }), 'Landlords fetched successfully');
});

export const getAllCars = asyncHandler(async (req, res) => {
  return sendSuccess(res, await getCarsWithUsage(), 'Cars fetched successfully');
});

export const createCarAdmin = asyncHandler(async (req, res) => {
  const payload = normalizeAdminCarPayload(req.body);
  
  if (req.file) {
    payload.images = [{
      url: getUploadedImageUrl(req.file),
      alt: buildCarName(payload),
      isPrimary: true
    }];
  }

  const car = await Car.create(payload);
  const populated = await Car.findById(car._id).populate('owner', 'name email avatar phone');
  return sendSuccess(res, formatCarImages(populated), 'Car created successfully', 201);
});

export const updateCarAdmin = asyncHandler(async (req, res) => {
  const existingCar = await Car.findById(req.params.id);
  if (!existingCar) throw new ApiError(404, 'Car not found');

  const payload = normalizeAdminCarPayload(req.body, existingCar);

  if (req.file) {
    payload.images = [{
      url: getUploadedImageUrl(req.file),
      alt: buildCarName(payload),
      isPrimary: true
    }];
  }

  const car = await Car.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).populate('owner', 'name email avatar phone');
  return sendSuccess(res, formatCarImages(car), 'Car updated successfully');
});

export const updateCarStatus = asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      isAvailable: req.body.status === 'available'
    },
    { new: true, runValidators: true }
  ).populate('owner', 'name email avatar phone');

  if (!car) throw new ApiError(404, 'Car not found');
  return sendSuccess(res, formatCarImages(car), 'Car status updated successfully');
});

export const deleteCarAdmin = asyncHandler(async (req, res) => {
  await canDeleteCar(req.params.id);
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) throw new ApiError(404, 'Car not found');
  return sendSuccess(res, { id: car._id }, 'Car deleted successfully');
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  return sendSuccess(res, await getBookings(filter), 'Bookings fetched successfully');
});

export const getRevenueStats = asyncHandler(async (req, res) => {
  const bookings = await Booking.find();
  const totalRevenue = bookings
    .filter((booking) => ['confirmed', 'active', 'completed'].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);

  return sendSuccess(res, { totalRevenue: Math.round(totalRevenue * 100) / 100 }, 'Revenue statistics fetched successfully');
});

export const getSystemLogs = asyncHandler(async (req, res) => {
  return sendSuccess(res, [], 'System logs fetched successfully');
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(SAFE_USER_FIELDS);
  return sendSuccess(res, { user }, 'Admin profile fetched successfully');
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true
  }).select(SAFE_USER_FIELDS);

  return sendSuccess(res, { user }, 'Admin profile updated successfully');
});

export const getAllPassengers = getAllUsers;
export const getPassengerById = getAdminUserById;
export const createPassenger = createAdminUser;
export const updatePassenger = updateAdminUser;
export const deletePassenger = deleteAdminUser;
