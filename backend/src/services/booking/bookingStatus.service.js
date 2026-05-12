export const applyBookingStatusTransition = (booking, status) => {
  booking.status = status;

  if (status === 'confirmed') booking.confirmedAt = new Date();
  if (status === 'completed') booking.completedAt = new Date();
  if (status === 'cancelled') booking.cancelledAt = new Date();
};

export const syncCompletedStatusForBooking = (booking) => {
  if (!booking.endDate) return booking;

  if (new Date(booking.endDate) <= new Date() && booking.status === 'active') {
    applyBookingStatusTransition(booking, 'completed');
  }

  return booking;
};

export const syncCompletedStatusesForBookings = async (bookings) => {
  for (const b of bookings) {
    syncCompletedStatusForBooking(b);
    await b.save();
  }
};