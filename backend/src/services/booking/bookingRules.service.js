import ApiError from '../../utils/ApiError.js';

export const validateDates = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);

  if (isNaN(s) || isNaN(e)) {
    throw new ApiError(400, 'Invalid dates');
  }

  if (e <= s) {
    throw new ApiError(400, 'End must be after start');
  }

  return { start: s, end: e };
};