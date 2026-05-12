const buildUserSummary = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  };
};

const buildCarSummary = (car) => {
  if (!car) return null;

  return {
    id: car._id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: car.dailyRate,
    primaryImage: car.images?.[0]?.url || ''
  };
};

export const buildBookingResponse = (booking) => {
  const obj = booking.toObject ? booking.toObject({ virtuals: true }) : booking;

  return {
    ...obj,
    carSummary: buildCarSummary(obj.car),
    customerSummary: buildUserSummary(obj.customer),
    ownerSummary: buildUserSummary(obj.owner)
  };
};

export const serviceResult = ({
  data = null,
  message = 'Success',
  statusCode = 200,
  meta = null
} = {}) => ({
  data,
  message,
  statusCode,
  meta
});