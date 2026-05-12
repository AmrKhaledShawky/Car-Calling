export const roundCurrency = (value) => Math.round(value * 100) / 100;

export const toIdString = (value) => {
  if (!value) return '';
  if (value._id) return value._id.toString();
  return value.toString();
};

export const getUserId = (user) => user?.id || user?._id?.toString();
export const getUserObjectId = (user) => user?._id || user?.id;

export const parsePositiveInteger = (value, fallback, { max } = {}) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
};

export const buildFallbackLocationAddress = (car) => {
  const parts = [
    car?.location?.address,
    car?.location?.city,
    car?.location?.state
  ]
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);

  return parts.join(', ') || 'Owner location';
};