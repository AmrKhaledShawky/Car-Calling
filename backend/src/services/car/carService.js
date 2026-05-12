import Car from '../../models/Car.js';
import Booking from '../../models/Booking.js';
import ApiError from '../../utils/ApiError.js';
import ApiFeatures from '../../utils/ApiFeatures.js';
import logger from '../../utils/logger.js';
import config from '../../config/env.config.js';
import { syncCompletedStatusesForBookings } from '../booking/bookingStatus.service.js';

const serviceResult = ({ data = null, message = 'Success', statusCode = 200, meta = null } = {}) => ({
  data,
  message,
  statusCode,
  meta
});

const getUserId = (user) => user?.id || user?._id?.toString();
const getUserObjectId = (user) => user?._id || user?.id;

const getAbsoluteUrl = (path) => {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${config.serverUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
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
    // Create a copy to avoid mutating the virtual result directly if it's shared
    carObj.primaryImage = {
      ...carObj.primaryImage,
      url: getAbsoluteUrl(carObj.primaryImage.url)
    };
  }
  
  return carObj;
};

const buildCarListQuery = (requestQuery = {}) => {
  const query = { ...requestQuery };
  const baseFilter = {};

  if (query.available !== undefined) {
    query.isAvailable = query.available === true || query.available === 'true';
    delete query.available;
  }

  if (query.minPrice) {
    query['dailyRate[gte]'] = query.minPrice;
    delete query.minPrice;
  }

  if (query.maxPrice) {
    query['dailyRate[lte]'] = query.maxPrice;
    delete query.maxPrice;
  }

  if (query.location) {
    baseFilter['location.city'] = { $regex: query.location, $options: 'i' };
    delete query.location;
  }

  delete query.startDate;
  delete query.endDate;

  if (query.sortBy) {
    query.sort = `${query.sortOrder === 'asc' ? '' : '-'}${query.sortBy}`;
    delete query.sortBy;
    delete query.sortOrder;
  }

  return { baseFilter, query };
};

const buildPaginationMeta = (features, total, count, legacy = {}) => {
  const pagination = features.getPagination(total, count);

  return {
    count,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
    pagination: {
      ...pagination,
      ...legacy
    }
  };
};

const getActiveRentalConflict = async (carId) => Booking.exists({
  car: carId,
  status: { $in: ['confirmed', 'active'] },
  endDate: { $gte: new Date() }
});

const normalizeCarPayload = (payload, { owner, existingCar } = {}) => {
  if (owner) {
    payload.owner = owner;
  }

  payload.vin = typeof payload.vin === 'string' ? payload.vin.trim().toUpperCase() : payload.vin;
  payload.licensePlate = typeof payload.licensePlate === 'string'
    ? payload.licensePlate.trim().toUpperCase()
    : payload.licensePlate;
  payload.category = normalizeTextOption(payload.category);
  payload.fuelType = normalizeTextOption(payload.fuelType);
  payload.transmission = normalizeTextOption(payload.transmission);
  payload.status = normalizeTextOption(payload.status);

  const nextStatus = payload.status || existingCar?.status || 'available';

  payload.status = nextStatus;
  payload.licensePlate = payload.licensePlate || undefined;
  payload.color = payload.color || 'Unknown';
  payload.mileage = payload.mileage ?? 0;
  payload.doors = payload.doors ?? 4;
  payload.isAvailable = nextStatus === 'available';
  
  // Handle FormData array
  if (payload['features[]']) {
    payload.features = Array.isArray(payload['features[]']) ? payload['features[]'] : [payload['features[]']];
  }
  payload.location = {
    address: payload.location?.address || payload['location[address]'] || '',
    city: payload.location?.city || payload['location[city]'] || existingCar?.location?.city,
    state: payload.location?.state || payload['location[state]'] || '',
    zipCode: payload.location?.zipCode || payload['location[zipCode]'] || '',
    coordinates: payload.location?.coordinates || payload['location[coordinates]'] || existingCar?.location?.coordinates
  };

  return payload;
};

export const getCars = async ({ query: requestQuery = {} } = {}) => {
  const { baseFilter, query } = buildCarListQuery(requestQuery);
  const features = new ApiFeatures(
    Car.find(baseFilter).populate('owner', 'name email phone'),
    query
  )
    .filter()
    .search(['make', 'model', 'category', 'location.city'])
    .sort()
    .limitFields()
    .paginate();

  const total = await features.count();
  const cars = await features.query;
  const formattedCars = cars.map(formatCarImages);

  return serviceResult({
    message: 'Cars fetched successfully',
    data: formattedCars,
    meta: buildPaginationMeta(features, total, cars.length, {
      currentPage: features.pagination.page,
      totalCars: total
    })
  });
};

export const getOwnerCars = async ({ query: requestQuery = {}, user } = {}) => {
  const { baseFilter, query } = buildCarListQuery(requestQuery);
  const features = new ApiFeatures(
    Car.find({ ...baseFilter, owner: getUserObjectId(user) }),
    query
  )
    .filter()
    .search(['make', 'model', 'category', 'location.city'])
    .sort()
    .limitFields()
    .paginate({ defaultLimit: 100 });

  const total = await features.count();
  const cars = await features.query;
  const lockedCarIds = new Set(
    (
      await Booking.find({
        owner: getUserObjectId(user),
        status: { $in: ['confirmed', 'active'] },
        endDate: { $gte: new Date() }
      }).select('car')
    ).map((booking) => booking.car.toString())
  );

  const data = cars.map((car) => {
    const formatted = formatCarImages(car);
    return {
      ...formatted,
      statusLocked: lockedCarIds.has(car._id.toString())
    };
  });

  return serviceResult({
    message: 'Cars fetched successfully',
    data,
    meta: buildPaginationMeta(features, total, data.length, {
      currentPage: features.pagination.page,
      totalCars: total
    })
  });
};

export const getAvailableCars = async ({ query: requestQuery = {} } = {}) => {
  const { baseFilter, query } = buildCarListQuery({
    sort: '-averageRating,-createdAt',
    limit: 20,
    ...requestQuery,
    available: true
  });
  baseFilter.status = 'available';

  const features = new ApiFeatures(
    Car.find(baseFilter).populate('owner', 'name avatar isVerifiedLandlord'),
    query
  )
    .filter()
    .search(['make', 'model', 'category', 'location.city'])
    .sort('-averageRating -createdAt')
    .limitFields()
    .paginate({ defaultLimit: 20 });

  const total = await features.count();
  const cars = await features.query;
  const formattedCars = cars.map(formatCarImages);

  return serviceResult({
    message: 'Available cars fetched successfully',
    data: formattedCars,
    meta: buildPaginationMeta(features, total, cars.length, {
      currentPage: features.pagination.page,
      totalCars: total
    })
  });
};

export const searchCars = async ({ query: requestQuery = {} } = {}) => {
  const dateFilter = {};

  if (requestQuery.startDate && requestQuery.endDate) {
    const overlappingBookings = await Booking.findOverlappingBookings(
      null,
      new Date(requestQuery.startDate),
      new Date(requestQuery.endDate)
    );
    dateFilter._id = { $nin: overlappingBookings.map((booking) => booking.car) };
  }

  const { baseFilter, query } = buildCarListQuery({
    ...requestQuery,
    available: true,
    limit: requestQuery.limit || 50
  });
  baseFilter.status = 'available';

  const features = new ApiFeatures(
    Car.find({ ...baseFilter, ...dateFilter }).populate('owner', 'name avatar isVerifiedLandlord'),
    query
  )
    .filter()
    .search(['make', 'model', 'category', 'location.city'])
    .sort('-averageRating')
    .limitFields()
    .paginate({ defaultLimit: 50 });

  const total = await features.count();
  const cars = await features.query;
  const formattedCars = cars.map(formatCarImages);

  return serviceResult({
    message: 'Cars fetched successfully',
    data: formattedCars,
    meta: buildPaginationMeta(features, total, cars.length, {
      currentPage: features.pagination.page,
      totalCars: total
    })
  });
};

export const getCar = async ({ id }) => {
  const car = await Car.findById(id)
    .populate('owner', 'name email phone avatar isVerifiedLandlord');

  if (!car) {
    throw new ApiError(404, 'Car not found');
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

  return serviceResult({
    message: 'Car fetched successfully',
    data: {
      ...formatCarImages(car),
      unavailableRanges
    }
  });
};

export const createCar = async ({ body = {}, user, file = null }) => {
  const carPayload = normalizeCarPayload({ ...body }, { owner: getUserObjectId(user) });

  if (file) {
    const imageUrl = getUploadedImageUrl(file);
    carPayload.images = [
      {
        url: imageUrl,
        alt: `${carPayload.year} ${carPayload.make} ${carPayload.model}`.trim(),
        isPrimary: true
      }
    ];
  }

  const car = await Car.create(carPayload);

  logger.info({
    carId: car._id.toString(),
    userId: getUserId(user)
  }, 'Car created');

  return serviceResult({
    statusCode: 201,
    message: 'Car created successfully',
    data: car
  });
};

export const updateCar = async ({ id, body = {}, user, car: ownedCar = null, file = null }) => {
  let car = ownedCar || await Car.findById(id);

  if (!car) {
    throw new ApiError(404, 'Car not found');
  }

  const nextStatus = body.status || car.status;
  if (nextStatus !== car.status) {
    const hasProtectedBooking = await getActiveRentalConflict(id);

    if (hasProtectedBooking) {
      throw new ApiError(400, 'You cannot change the status while this car has a confirmed or active rental period.');
    }
  }

  const carPayload = normalizeCarPayload({ ...body }, { existingCar: car });

  if (file) {
    const imageUrl = getUploadedImageUrl(file);
    carPayload.images = [
      {
        url: imageUrl,
        alt: `${carPayload.year} ${carPayload.make} ${carPayload.model}`.trim(),
        isPrimary: true
      }
    ];
  }

  car = await Car.findByIdAndUpdate(id, carPayload, {
    new: true,
    runValidators: true
  });

  logger.info({
    carId: id,
    userId: getUserId(user)
  }, 'Car updated');

  return serviceResult({
    message: 'Car updated successfully',
    data: formatCarImages(car)
  });
};

export const deleteCar = async ({ id, user, car: ownedCar = null }) => {
  const car = ownedCar || await Car.findById(id);

  if (!car) {
    throw new ApiError(404, 'Car not found');
  }

  const activeBookings = await Booking.find({
    car: id,
    status: { $in: ['confirmed', 'active'] }
  });

  if (activeBookings.length > 0) {
    throw new ApiError(400, 'Cannot delete car with active bookings');
  }

  await Car.findByIdAndDelete(id);

  logger.info({
    carId: id,
    userId: getUserId(user)
  }, 'Car deleted');

  return serviceResult({
    message: 'Car deleted successfully'
  });
};

export const getMyCars = getOwnerCars;

export default {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getOwnerCars,
  getMyCars,
  getAvailableCars,
  searchCars
};
