import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';

const ADDITIONAL_SERVICE_PRICING = {
  child_seat: 15,
  gps: 10,
  additional_driver: 25,
  doorstep_delivery: 40
};

const roundCurrency = (value) => Math.round(value * 100) / 100;

const BOOKING_POPULATE = [
  { path: 'car', select: 'make model year images dailyRate fuelType transmission seats owner status location' },
  { path: 'customer', select: 'name email phone role' },
  { path: 'owner', select: 'name email phone role' }
];

const parsePositiveInteger = (value, fallback, { max } = {}) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  if (max) {
    return Math.min(parsedValue, max);
  }

  return parsedValue;
};

const buildBookingFilters = (query = {}) => {
  const filters = {};
  const { status, date, startDate, endDate } = query;

  if (status) {
    filters.status = status;
  }

  if (date) {
    const requestedDate = new Date(date);

    if (Number.isNaN(requestedDate.getTime())) {
      return { error: 'Invalid date filter' };
    }

    filters.startDate = { $lte: requestedDate };
    filters.endDate = { $gte: requestedDate };
  } else {
    if (startDate) {
      const requestedStartDate = new Date(startDate);

      if (Number.isNaN(requestedStartDate.getTime())) {
        return { error: 'Invalid startDate filter' };
      }

      filters.endDate = { ...(filters.endDate || {}), $gte: requestedStartDate };
    }

    if (endDate) {
      const requestedEndDate = new Date(endDate);

      if (Number.isNaN(requestedEndDate.getTime())) {
        return { error: 'Invalid endDate filter' };
      }

      filters.startDate = { ...(filters.startDate || {}), $lte: requestedEndDate };
    }
  }

  return { filters };
};

const buildPagination = (query = {}) => {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10, { max: 100 });
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
};

const buildBookingPagination = (page, limit, total) => ({
  currentPage: page,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  totalBookings: total,
  hasNext: page * limit < total,
  hasPrev: page > 1
});

const getScopedBookings = async ({ scope = {}, req }) => {
  const { filters, error } = buildBookingFilters(req.query);

  if (error) {
    return { error };
  }

  const query = { ...scope, ...filters };
  const { page, limit, skip } = buildPagination(req.query);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate(BOOKING_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query)
  ]);

  return {
    bookings,
    total,
    page,
    limit
  };
};

const getRequestValidationError = (req) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return null;
  }

  return {
    success: false,
    message: 'Validation failed',
    errors: errors.array()
  };
};

const buildUserSummary = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  };
};

const buildCarSummary = (car) => {
  if (!car) {
    return null;
  }

  return {
    id: car._id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: car.dailyRate,
    fuelType: car.fuelType,
    transmission: car.transmission,
    seats: car.seats,
    primaryImage: car.primaryImage?.url || car.images?.[0]?.url || ''
  };
};

const buildBookingResponse = (booking) => {
  const bookingObject = booking.toObject ? booking.toObject({ virtuals: true }) : booking;

  return {
    ...bookingObject,
    carSummary: buildCarSummary(bookingObject.car),
    customerSummary: buildUserSummary(bookingObject.customer),
    ownerSummary: buildUserSummary(bookingObject.owner),
    pricing: {
      duration: bookingObject.duration,
      dailyRate: bookingObject.dailyRate,
      subtotal: bookingObject.subtotal,
      serviceFee: bookingObject.serviceFee,
      insuranceFee: bookingObject.insuranceFee,
      tax: bookingObject.tax,
      totalAmount: bookingObject.totalAmount
    }
  };
};

const buildFallbackLocationAddress = (car) => {
  const parts = [
    car?.location?.address,
    car?.location?.city,
    car?.location?.state
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  return parts.join(', ') || 'Owner location';
};

const normalizeAdditionalServices = (services = []) => {
  if (!Array.isArray(services)) {
    return { error: 'Additional services must be an array' };
  }

  const normalizedServices = [];
  let additionalServicesTotal = 0;

  for (const service of services) {
    const serviceName = typeof service?.name === 'string' ? service.name.trim().toLowerCase() : '';
    const quantity = Number(service?.quantity || 1);

    if (!serviceName || !ADDITIONAL_SERVICE_PRICING[serviceName]) {
      return { error: `Unsupported additional service: ${service?.name || 'unknown'}` };
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: `Invalid quantity for additional service: ${serviceName}` };
    }

    const price = ADDITIONAL_SERVICE_PRICING[serviceName];
    additionalServicesTotal += price * quantity;
    normalizedServices.push({
      name: serviceName,
      price,
      quantity
    });
  }

  return {
    normalizedServices,
    additionalServicesTotal: roundCurrency(additionalServicesTotal)
  };
};

// Get all bookings (Admin only)
export const getBookings = async (req, res) => {
  try {
    const validationError = getRequestValidationError(req);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const scopedResult = await getScopedBookings({ req });

    if (scopedResult.error) {
      return res.status(400).json({
        success: false,
        message: scopedResult.error
      });
    }

    res.status(200).json({
      success: true,
      count: scopedResult.bookings.length,
      pagination: buildBookingPagination(scopedResult.page, scopedResult.limit, scopedResult.total),
      data: scopedResult.bookings.map(buildBookingResponse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  try {
    const validationError = getRequestValidationError(req);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const booking = await Booking.findById(req.params.id)
      .populate(BOOKING_POPULATE);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to see this booking
    const isCustomer = booking.customer._id.toString() === req.user.id;
    const isOwner = booking.owner._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: buildBookingResponse(booking)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private/Tenant
 */
export const createBooking = async (req, res) => {
  try {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check your booking details and try again.',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { 
      car, // Aligned with bookingValidation in routes/bookings.js
      startDate, 
      endDate, 
      pickupLocation, 
      returnLocation, 
      specialRequests, 
      additionalServices,
      insuranceType
    } = req.body;

    // 1. Basic Date Validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date' });
    }

    if (start < new Date(now.setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // 2. Load Selected Car
    const selectedCar = await Car.findById(car);
    if (!selectedCar) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check if car belongs to the user (can't rent own car)
    if (selectedCar.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own car' });
    }

    if (!selectedCar.isAvailable || selectedCar.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This car is currently unavailable for selected dates' });
    }

    // 3. Prevent Overlapping Bookings
    const overlapping = await Booking.findOverlappingBookings(car, start, end);
    if (overlapping.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This car is already booked for the selected period' 
      });
    }

    const { normalizedServices, additionalServicesTotal, error: servicesError } = normalizeAdditionalServices(additionalServices);
    if (servicesError) {
      return res.status(400).json({
        success: false,
        message: servicesError
      });
    }

    // 4. Calculate Pricing
    // Duration in days
    const diffTime = Math.abs(end - start);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const dailyRate = roundCurrency(selectedCar.getDiscountedRate(duration));
    const subtotal = roundCurrency(dailyRate * duration);
    
    // Fixed fees for demonstration (could be moved to a config/utility)
    const serviceFee = roundCurrency(subtotal * 0.05); // 5% service fee
    const insuranceFee = roundCurrency(
      insuranceType === 'premium' ? (20 * duration) : (insuranceType === 'basic' ? (10 * duration) : 0)
    );
    const tax = roundCurrency((subtotal + serviceFee + insuranceFee + additionalServicesTotal) * 0.10); // 10% tax
    
    const totalAmount = roundCurrency(subtotal + serviceFee + insuranceFee + additionalServicesTotal + tax);

    // 5. Setup Locations (default to car's location if not provided)
    const finalPickup = {
      address: pickupLocation?.address || buildFallbackLocationAddress(selectedCar),
      coordinates: pickupLocation?.coordinates || selectedCar.location.coordinates,
      instructions: pickupLocation?.instructions || 'Standard pickup at owner location'
    };

    const finalReturn = {
      address: returnLocation?.address || buildFallbackLocationAddress(selectedCar),
      coordinates: returnLocation?.coordinates || selectedCar.location.coordinates,
      instructions: returnLocation?.instructions || 'Standard return at owner location'
    };

    // 6. Create and Save Booking
    const booking = new Booking({
      customer: req.user.id,
      owner: selectedCar.owner,
      car: car,
      startDate: start,
      endDate: end,
      duration,
      dailyRate,
      subtotal,
      serviceFee,
      insuranceFee,
      insurance: {
        type: insuranceType || 'basic',
        coverage: insuranceType === 'premium' ? 50000 : 10000,
        deductible: insuranceType === 'premium' ? 500 : 2000
      },
      tax,
      totalAmount,
      pickupLocation: finalPickup,
      returnLocation: finalReturn,
      specialRequests,
      additionalServices: normalizedServices,
      status: 'pending',
      paymentStatus: 'pending',
      source: 'website'
    });

    await booking.save();

    // 7. Return Populated Response
    const responseBooking = await Booking.findById(booking._id)
      .populate('car', 'make model year images dailyRate fuelType transmission seats')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: buildBookingResponse(responseBooking)
    });

  } catch (error) {
    console.error('Booking Creation Error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Some booking details are missing or invalid.',
        errors: Object.entries(error.errors).map(([field, value]) => ({
          field,
          message: value.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the booking',
      error: error.message
    });
  }
};

// Update booking details
export const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only customer or owner can update (with different permissions)
    const isCustomer = booking.customer.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;

    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Business logic: Customers can only update special requests or some details if pending
    // Owners might update pickup/return instructions
    
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isCustomer = booking.customer.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;

    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if it's too late to cancel (if implemented in model)
    // if (!booking.canCancel()) { ... }

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason || (isCustomer ? 'customer_request' : 'owner_cancelled');
    
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Get bookings where user is the customer
export const getMyBookings = async (req, res) => {
  try {
    const validationError = getRequestValidationError(req);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const scopedResult = await getScopedBookings({
      req,
      scope: { customer: req.user._id }
    });

    if (scopedResult.error) {
      return res.status(400).json({
        success: false,
        message: scopedResult.error
      });
    }

    res.status(200).json({
      success: true,
      count: scopedResult.bookings.length,
      pagination: buildBookingPagination(scopedResult.page, scopedResult.limit, scopedResult.total),
      data: scopedResult.bookings.map(buildBookingResponse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your bookings',
      error: error.message
    });
  }
};

// Get bookings for cars owned by the user
export const getOwnerBookings = async (req, res) => {
  try {
    const validationError = getRequestValidationError(req);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const scopedResult = await getScopedBookings({
      req,
      scope: { owner: req.user._id }
    });

    if (scopedResult.error) {
      return res.status(400).json({
        success: false,
        message: scopedResult.error
      });
    }

    res.status(200).json({
      success: true,
      count: scopedResult.bookings.length,
      pagination: buildBookingPagination(scopedResult.page, scopedResult.limit, scopedResult.total),
      data: scopedResult.bookings.map(buildBookingResponse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching owner bookings',
      error: error.message
    });
  }
};

// Owner confirms a booking
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only owner can confirm
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a booking that is ${booking.status}`
      });
    }

    booking.status = 'confirmed';
    booking.confirmedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming booking',
      error: error.message
    });
  }
};

// Complete a booking (car returned)
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only owner can complete (usually after receiving car back)
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to complete this booking'
      });
    }

    booking.status = 'completed';
    booking.completedAt = Date.now();
    booking.returnedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message
    });
  }
};
