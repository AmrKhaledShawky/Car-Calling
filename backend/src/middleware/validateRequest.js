import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const normalizeValidationErrors = (errors = []) => errors.map((error) => ({
  field: error.path || error.param,
  message: error.msg
}));

const validateRequest = (message = 'Validation failed') => (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(new ApiError(400, message, normalizeValidationErrors(result.array())));
};

export default validateRequest;
