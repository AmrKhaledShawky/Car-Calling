import { body } from 'express-validator';

export const CATEGORY_OPTIONS = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'luxury', 'sports'];
export const FUEL_OPTIONS = ['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in hybrid'];
export const TRANSMISSION_OPTIONS = ['manual', 'automatic', 'cvt', 'dct'];
export const OWNER_STATUS_OPTIONS = ['available', 'maintenance', 'inactive'];
export const ADMIN_STATUS_OPTIONS = ['available', 'rented', 'maintenance', 'inactive'];
export const FEATURE_OPTIONS = [
  'air-conditioning',
  'heating',
  'bluetooth',
  'usb-charging',
  'gps-navigation',
  'backup-camera',
  'cruise-control',
  'apple-carplay',
  'android-auto',
  'sunroof',
  'leather-seats',
  'heated-seats',
  'keyless-entry',
  'remote-start',
  'towing-package',
  'all-wheel-drive',
  'four-wheel-drive',
  'premium-audio',
  'autopilot'
];

const VIN_REGEX = /^[A-Z0-9]{17}$/;
const optionList = (options) => options.join(', ');

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const getLocationCity = (req) => req.body?.location?.city ?? req.body?.['location[city]'];
const normalizeOptionValue = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : value
);

const validateNumber = ({ field, requiredMessage, invalidMessage, min, max, integer = false, optional = false }) => {
  let chain = body(field);

  if (optional) {
    chain = chain.optional({ values: 'falsy' });
  } else {
    chain = chain.notEmpty().withMessage(requiredMessage).bail();
  }

  return chain.custom((value) => {
    const number = Number(value);
    const hasValidNumber = Number.isFinite(number);
    const hasValidType = integer ? Number.isInteger(number) : hasValidNumber;
    const aboveMin = min === undefined || number >= min;
    const belowMax = max === undefined || number <= max;

    if (!hasValidNumber || !hasValidType || !aboveMin || !belowMax) {
      throw new Error(invalidMessage);
    }

    return true;
  });
};

const validateOption = ({ field, options, message, optional = false }) => {
  let chain = body(field).customSanitizer(normalizeOptionValue);

  if (optional) {
    chain = chain.optional({ values: 'falsy' });
  } else {
    chain = chain.notEmpty().withMessage(message).bail();
  }

  return chain.isIn(options).withMessage(message);
};

const validateFeatures = (field) => body(field)
  .optional({ values: 'falsy' })
  .customSanitizer((value) => {
    const normalizeFeature = (feature) => (
      typeof feature === 'string'
        ? feature.trim().toLowerCase().replace(/\s+/g, '-')
        : feature
    );

    return Array.isArray(value) ? value.map(normalizeFeature) : normalizeFeature(value);
  })
  .custom((value) => {
    const values = Array.isArray(value) ? value : [value];
    const invalidFeature = values.find((feature) => !FEATURE_OPTIONS.includes(feature));

    if (invalidFeature) {
      throw new Error(`Choose only supported features: ${optionList(FEATURE_OPTIONS)}.`);
    }

    return true;
  });

export const createCarValidation = ({ statusOptions = OWNER_STATUS_OPTIONS, requireOwner = false } = {}) => [
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Enter the car make, for example Toyota.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Make must be 50 characters or fewer.'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Enter the car model, for example Corolla.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Model must be 50 characters or fewer.'),
  body('year')
    .notEmpty()
    .withMessage('Enter the car model year.')
    .bail()
    .custom((value) => {
      const maxYear = new Date().getFullYear() + 1;
      const year = Number(value);

      if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
        throw new Error(`Enter a year between 1900 and ${maxYear}.`);
      }

      return true;
    }),
  body('vin')
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage('Enter the VIN.')
    .bail()
    .matches(VIN_REGEX)
    .withMessage('Enter a 17-character VIN using letters A-Z and digits 0-9.'),
  body('licensePlate')
    .optional({ values: 'falsy' })
    .trim()
    .toUpperCase(),
  validateOption({
    field: 'category',
    options: CATEGORY_OPTIONS,
    message: `Choose a category: ${optionList(CATEGORY_OPTIONS)}.`
  }),
  validateOption({
    field: 'fuelType',
    options: FUEL_OPTIONS,
    message: `Choose a fuel type: ${optionList(FUEL_OPTIONS)}.`
  }),
  validateOption({
    field: 'transmission',
    options: TRANSMISSION_OPTIONS,
    message: `Choose a transmission: ${optionList(TRANSMISSION_OPTIONS)}.`
  }),
  validateNumber({
    field: 'seats',
    requiredMessage: 'Enter how many seats the car has.',
    invalidMessage: 'Seats must be a whole number from 1 to 9.',
    min: 1,
    max: 9,
    integer: true
  }),
  validateNumber({
    field: 'doors',
    invalidMessage: 'Doors must be a whole number from 2 to 5.',
    min: 2,
    max: 5,
    integer: true,
    optional: true
  }),
  body('color')
    .optional({ values: 'falsy' })
    .trim(),
  validateNumber({
    field: 'mileage',
    invalidMessage: 'Mileage must be 0 or more.',
    min: 0,
    optional: true
  }),
  validateNumber({
    field: 'dailyRate',
    requiredMessage: 'Enter the daily rental price.',
    invalidMessage: 'Daily rate must be 0 or more.',
    min: 0
  }),
  validateOption({
    field: 'status',
    options: statusOptions,
    message: `Choose a status: ${optionList(statusOptions)}.`,
    optional: true
  }),
  body('location.city')
    .custom((_, { req }) => {
      const city = getLocationCity(req);

      if (isBlank(city)) {
        throw new Error('Enter the city where renters can pick up the car.');
      }

      return true;
    }),
  body('location.address')
    .optional({ values: 'falsy' })
    .trim(),
  body('location.state')
    .optional({ values: 'falsy' })
    .trim(),
  body('location.zipCode')
    .optional({ values: 'falsy' })
    .trim(),
  validateFeatures('features'),
  validateFeatures('features[]'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be 500 characters or fewer.'),
  ...(requireOwner
    ? [
        body('owner')
          .notEmpty()
          .withMessage('Select the landlord who owns this car.')
          .bail()
          .isMongoId()
          .withMessage('Select a valid landlord for this car.')
      ]
    : [])
];

export const createOwnerCarValidation = () => createCarValidation();

export const createAdminCarValidation = () => createCarValidation({
  statusOptions: ADMIN_STATUS_OPTIONS,
  requireOwner: true
});
