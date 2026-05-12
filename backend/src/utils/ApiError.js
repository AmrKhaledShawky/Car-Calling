class ApiError extends Error {
  constructor(statusCode, message = 'Error', errors = null) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.status = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
