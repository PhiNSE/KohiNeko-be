module.exports = class ApiResponse {
  constructor(status, message, data) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static success(message, data) {
    return new ApiResponse(200, message, data);
  }

  static error(message, data) {
    return new ApiResponse(500, message, data);
  }
};
