import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { normalizeRole } from './authorize.middleware.js';

const getUserId = (user) => user?._id?.toString() || user?.id?.toString();

const getPathValue = (source, path) => path
  .split('.')
  .reduce((value, key) => value?.[key], source);

const toIdString = (value) => {
  if (!value) return '';
  if (value._id) return value._id.toString();
  if (value.id && typeof value.id !== 'function') return value.id.toString();
  return value.toString();
};

export const ownsResource = (resource, user, ownerFields = ['owner']) => {
  const userId = getUserId(user);

  if (!resource || !userId) {
    return false;
  }

  return ownerFields.some((field) => {
    const ownerValue = getPathValue(resource, field);

    if (Array.isArray(ownerValue)) {
      return ownerValue.some((value) => toIdString(value) === userId);
    }

    return toIdString(ownerValue) === userId;
  });
};

const getResourceId = (req, idParam) => (
  req.params?.[idParam]
  || req.body?.[idParam]
);

const attachResource = (req, attachAs, resource) => {
  req[attachAs] = resource;
  req.resource = resource;
};

export const validateOwnership = ({
  model,
  idParam = 'id',
  ownerFields = ['owner'],
  attachAs = 'resource',
  allowAdmin = true,
  notFoundMessage = 'Resource not found',
  forbiddenMessage = 'Not authorized to access this resource'
} = {}) => asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated');
  }

  if (!model?.findById) {
    throw new ApiError(500, 'Ownership middleware is missing a model');
  }

  const resourceId = getResourceId(req, idParam);

  if (!resourceId) {
    throw new ApiError(400, 'Resource ID not found');
  }

  const resource = await model.findById(resourceId);

  if (!resource) {
    throw new ApiError(404, notFoundMessage);
  }

  attachResource(req, attachAs, resource);

  if (allowAdmin && normalizeRole(req.user.role) === 'admin') {
    return next();
  }

  if (!ownsResource(resource, req.user, ownerFields)) {
    throw new ApiError(403, forbiddenMessage);
  }

  return next();
});

export const validateCarOwnership = validateOwnership({
  model: Car,
  ownerFields: ['owner'],
  attachAs: 'car',
  notFoundMessage: 'Car not found',
  forbiddenMessage: 'Not authorized to access this car'
});

export const validateBookingOwnership = validateOwnership({
  model: Booking,
  ownerFields: ['customer', 'owner'],
  attachAs: 'booking',
  notFoundMessage: 'Booking not found',
  forbiddenMessage: 'Not authorized to access this booking'
});

export const validateBookingOwner = validateOwnership({
  model: Booking,
  ownerFields: ['owner'],
  attachAs: 'booking',
  allowAdmin: false,
  notFoundMessage: 'Booking not found',
  forbiddenMessage: 'Only owners can manage this booking'
});
