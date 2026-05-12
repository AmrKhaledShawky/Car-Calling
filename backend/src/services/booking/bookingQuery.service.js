import Booking from '../../models/Booking.js';
import ApiFeatures from '../../utils/ApiFeatures.js';

export const getScopedBookings = async ({ query = {}, scope = {} }) => {
  const features = new ApiFeatures(
    Booking.find(scope).populate('car customer owner'),
    query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const total = await features.count();
  const bookings = await features.query;
  const pagination = features.getPagination(total, bookings.length);

  return {
    bookings,
    count: bookings.length,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
    pagination
  };
};
