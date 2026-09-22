export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictError";
  }
}
