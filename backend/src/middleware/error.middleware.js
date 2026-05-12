import config from '../config/env.config.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

const normalizeValidationErrors = (errors = {}) => Object.values(errors).map((error) => ({
  field: error.path || error.param,
  message: error.message || error.msg || String(error)
}));

const normalizeArrayErrors = (errors = []) => errors.map((error) => (
  typeof error === 'string'
    ? { message: error }
    : {
        field: error.path || error.param || error.field,
        message: error.message || error.msg || String(error)
      }
));

const DUPLICATE_FIELD_MESSAGES = {
  vin: 'This VIN is already listed. Enter a unique 17-character VIN for this car.',
  licensePlate: 'This license plate is already listed. Enter a different plate number or leave it blank if you do not know it.'
};

const handleMongooseValidationError = (error) => ({
  statusCode: 400,
  message: 'Please fix the highlighted car details and try again.',
  errors: normalizeValidationErrors(error.errors)
});

const handleMongooseCastError = (error) => ({
  statusCode: 400,
  message: `Invalid ${error.path || 'identifier'}`,
  errors: [{
    field: error.path,
    message: `Invalid ${error.path || 'value'}: ${error.value}`
  }]
});

const handleDuplicateKeyError = (error) => {
  const duplicateFields = Object.keys(error.keyValue || {});
  const duplicateErrors = duplicateFields.map((field) => ({
    field,
    message: DUPLICATE_FIELD_MESSAGES[field] || `${field} already exists`
  }));

  return {
    statusCode: 400,
    message: duplicateFields.length === 1
      ? duplicateErrors[0].message
      : 'Duplicate field value',
    errors: duplicateErrors
  };
};

const handleMulterError = (error) => ({
  statusCode: 400,
  message: error.code === 'LIMIT_FILE_SIZE'
    ? 'Image must be 5 MB or smaller.'
    : error.message || 'Could not upload the image.',
  errors: [{
    field: error.field || 'image',
    message: error.code === 'LIMIT_FILE_SIZE'
      ? 'Choose an image smaller than 5 MB.'
      : error.message || 'Could not upload the image.'
  }]
});

const handleJwtError = (error) => ({
  statusCode: 401,
  message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
  errors: null
});

const normalizeError = (error) => {
  if (error.name === 'ValidationError') {
    return handleMongooseValidationError(error);
  }

  if (error.name === 'CastError') {
    return handleMongooseCastError(error);
  }

  if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  if (error.name === 'MulterError') {
    return handleMulterError(error);
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return handleJwtError(error);
  }

  if (Array.isArray(error.errors)) {
    return {
      statusCode: error.statusCode || error.status || 400,
      message: error.message || 'Validation Error',
      errors: normalizeArrayErrors(error.errors)
    };
  }

  return {
    statusCode: error.statusCode || error.status || 500,
    message: error.message || 'Internal server error',
    errors: error.errors || null
  };
};

const getDevelopmentMeta = (error) => {
  if (config.nodeEnv !== 'development' || !error.stack) {
    return null;
  }

  return {
    stack: error.stack
  };
};

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const { statusCode, message, errors } = normalizeError(error);
  const logContext = {
    err: error,
    statusCode,
    method: req.method,
    path: req.originalUrl || req.url
  };

  if (statusCode >= 500) {
    logger.error(logContext, message);
  } else {
    logger.warn(logContext, message);
  }

  return ApiResponse.send(
    res,
    statusCode,
    ApiResponse.error(message, errors, null, getDevelopmentMeta(error))
  );
};

export default errorMiddleware;
