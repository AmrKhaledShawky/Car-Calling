import { validationResult } from 'express-validator';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import { syncCompletedStatusesForBookings } from './bookingController.js';

const getActiveRentalConflict = async (carId) => Booking.exists({
  car: carId,
  status: { $in: ['confirmed', 'active'] },
  endDate: { $gte: new Date() }
});

// @desc    Get all cars with filtering and pagination
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    // Build query
    let query = {};

    // Filtering
    const { category, fuelType, transmission, minPrice, maxPrice, location, available } = req.query;

    if (category) query.category = category;
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (available === 'true') query.isAvailable = true;

    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = parseFloat(minPrice);
      if (maxPrice) query.dailyRate.$lte = parseFloat(maxPrice);
    }

    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = {};
    sort[sortBy] = sortOrder;

    // Execute query
    const cars = await Car.find(query)
      .populate('owner', 'name email phone')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await Car.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCars: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: cars.length,
      pagination,
      data: cars
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
export const getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name email phone avatar isVerifiedLandlord');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const approvedBookings = await Booking.find({
      car: car._id,
      status: { $in: ['confirmed', 'active'] },
      endDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
      .select('startDate endDate status')
      .sort({ startDate: 1 });

    await syncCompletedStatusesForBookings(approvedBookings);

    const unavailableRanges = approvedBookings
      .filter((booking) => ['confirmed', 'active'].includes(booking.status))
      .map((booking) => ({
        id: booking._id,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate
      }));

    res.status(200).json({
      success: true,
      data: {
        ...car.toObject({ virtuals: true }),
        unavailableRanges
      }
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private (Landlord only)
export const createCar = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the highlighted car details and try again.',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    // Add owner to req.body
    req.body.owner = req.user._id;
    req.body.licensePlate = req.body.licensePlate || undefined;
    req.body.color = req.body.color || 'Unknown';
    req.body.mileage = req.body.mileage ?? 0;
    req.body.doors = req.body.doors ?? 4;
    req.body.isAvailable = req.body.status === 'available';
    req.body.location = {
      address: req.body.location?.address || '',
      city: req.body.location?.city,
      state: req.body.location?.state || '',
      zipCode: req.body.location?.zipCode || '',
      coordinates: req.body.location?.coordinates
    };

    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      data: car
    });
  } catch (error) {
    console.error('Create car error:', error);

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
      message: 'Server error'
    });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private (Owner/Admin only)
export const updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner or admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this car'
      });
    }

    const nextStatus = req.body.status || car.status;
    if (nextStatus !== car.status) {
      const hasProtectedBooking = await getActiveRentalConflict(req.params.id);

      if (hasProtectedBooking) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change the status while this car has a confirmed or active rental period.'
        });
      }
    }

    req.body.licensePlate = req.body.licensePlate || undefined;
    req.body.color = req.body.color || 'Unknown';
    req.body.mileage = req.body.mileage ?? 0;
    req.body.doors = req.body.doors ?? 4;
    req.body.isAvailable = req.body.status === 'available';
    req.body.location = {
      address: req.body.location?.address || '',
      city: req.body.location?.city || car.location?.city,
      state: req.body.location?.state || '',
      zipCode: req.body.location?.zipCode || '',
      coordinates: req.body.location?.coordinates || car.location?.coordinates
    };

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    console.error('Update car error:', error);

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
      message: 'Server error'
    });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private (Owner/Admin only)
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner or admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this car'
      });
    }

    // Check if car has active bookings
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
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current user's cars
// @route   GET /api/cars/owner/my-cars
// @access  Private (Landlord only)
export const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    const lockedCarIds = new Set(
      (
        await Booking.find({
          owner: req.user._id,
          status: { $in: ['confirmed', 'active'] },
          endDate: { $gte: new Date() }
        }).select('car')
      ).map((booking) => booking.car.toString())
    );

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars.map((car) => ({
        ...car.toObject({ virtuals: true }),
        statusLocked: lockedCarIds.has(car._id.toString())
      }))
    });
  } catch (error) {
    console.error('Get my cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available cars
// @route   GET /api/cars/available
// @access  Public
export const getAvailableCars = async (req, res) => {
  try {
    const cars = await Car.findAvailable()
      .populate('owner', 'name avatar isVerifiedLandlord')
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('Get available cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search cars
// @route   GET /api/cars/search
// @access  Public
export const searchCars = async (req, res) => {
  try {
    const { q, location, startDate, endDate } = req.query;

    let query = { isAvailable: true };

    // Text search
    if (q) {
      query.$or = [
        { make: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    // Location search
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Date availability check
    if (startDate && endDate) {
      const overlappingBookings = await Booking.findOverlappingBookings(null, new Date(startDate), new Date(endDate));
      const bookedCarIds = overlappingBookings.map(booking => booking.car);
      query._id = { $nin: bookedCarIds };
    }

    const cars = await Car.find(query)
      .populate('owner', 'name avatar isVerifiedLandlord')
      .sort({ averageRating: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('Search cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
