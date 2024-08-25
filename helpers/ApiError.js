const HttpStatusCodes = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  // Add more status codes as needed
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  //following all are static methods that return new instances of ApiError
  //so there is no need to create new instances in the controllers i.e., new ApiError(..) format
  static badRequest(message) {
    return new ApiError(HttpStatusCodes.BAD_REQUEST, message);
  }

  static internal(message) {
    return new ApiError(HttpStatusCodes.INTERNAL_SERVER_ERROR, message);
  }

  static unauthorized(message) {
    return new ApiError(HttpStatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(message) {
    return new ApiError(HttpStatusCodes.FORBIDDEN, message);
  }
}

export default ApiError;
