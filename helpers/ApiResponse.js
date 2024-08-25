class ApiResponse {
  constructor(statusCode, data, message = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  send(res) {
    res.status(this.statusCode).json({
      status: this.statusCode < 400 ? 'success' : 'error',
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
