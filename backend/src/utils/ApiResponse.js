const isExpressResponse = (value) => (
  value &&
  typeof value.status === 'function' &&
  typeof value.json === 'function'
);

class ApiResponse {
  constructor({ success, message = '', data = null, errors = null, meta = null } = {}) {
    this.success = Boolean(success);
    this.message = message;
    this.data = data;
    this.errors = errors;

    if (meta && typeof meta === 'object') {
      for (const [key, value] of Object.entries(meta)) {
        if (!['success', 'message', 'data', 'errors'].includes(key)) {
          this[key] = value;
        }
      }
    }
  }

  static success(resOrMessage = 'Success', data = null, message = 'Success', statusCode = 200, meta = null) {
    if (isExpressResponse(resOrMessage)) {
      return ApiResponse.send(
        resOrMessage,
        statusCode,
        new ApiResponse({
          success: true,
          message,
          data,
          errors: null,
          meta
        })
      );
    }

    return new ApiResponse({
      success: true,
      message: resOrMessage,
      data,
      errors: null
    });
  }

  static error(message = 'Error', errors = null, data = null, meta = null) {
    return new ApiResponse({
      success: false,
      message,
      data,
      errors,
      meta
    });
  }

  static send(res, statusCode, response) {
    const payload = response instanceof ApiResponse
      ? response
      : new ApiResponse(response);

    return res.status(statusCode).json(payload);
  }
}

export default ApiResponse;
