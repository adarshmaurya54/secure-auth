export class ApiError extends Error {
  statusCode: number;

  constructor(
    statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.name = "ApiError";

    Object.setPrototypeOf(
      this,
      ApiError.prototype
    );
  }
}