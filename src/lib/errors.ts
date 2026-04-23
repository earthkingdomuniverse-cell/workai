export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'BAD_REQUEST_ERROR'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE_ERROR'
  | 'RATE_LIMIT_ERROR';

export interface ErrorOptions {
  code?: string;
  message?: string;
  details?: Record<string, any>;
  statusCode?: number;
  type?: ErrorType;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly details?: Record<string, any>;
  public readonly isAppError: boolean = true;

  constructor(
    message: string,
    {
      statusCode = 500,
      code = 'INTERNAL_ERROR',
      details,
      type = 'INTERNAL_ERROR',
    }: ErrorOptions = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, any>) {
    super(message, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      type: 'VALIDATION_ERROR',
      details,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, {
      statusCode: 401,
      code: 'AUTHENTICATION_ERROR',
      type: 'AUTHENTICATION_ERROR',
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, {
      statusCode: 403,
      code: 'AUTHORIZATION_ERROR',
      type: 'AUTHORIZATION_ERROR',
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, {
      statusCode: 404,
      code: 'NOT_FOUND_ERROR',
      type: 'NOT_FOUND_ERROR',
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, {
      statusCode: 409,
      code: 'CONFLICT_ERROR',
      type: 'CONFLICT_ERROR',
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, {
      statusCode: 400,
      code: 'BAD_REQUEST_ERROR',
      type: 'BAD_REQUEST_ERROR',
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, {
      statusCode: 429,
      code: 'RATE_LIMIT_ERROR',
      type: 'RATE_LIMIT_ERROR',
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable') {
    super(message, {
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE_ERROR',
      type: 'SERVICE_UNAVAILABLE_ERROR',
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createError(
  type: ErrorType,
  message: string,
  details?: Record<string, any>,
): AppError {
  switch (type) {
    case 'VALIDATION_ERROR':
      return new ValidationError(message, details);
    case 'AUTHENTICATION_ERROR':
      return new AuthenticationError(message);
    case 'AUTHORIZATION_ERROR':
      return new AuthorizationError(message);
    case 'NOT_FOUND_ERROR':
      return new NotFoundError(message);
    case 'CONFLICT_ERROR':
      return new ConflictError(message);
    case 'BAD_REQUEST_ERROR':
      return new BadRequestError(message);
    case 'RATE_LIMIT_ERROR':
      return new RateLimitError(message);
    case 'SERVICE_UNAVAILABLE_ERROR':
      return new ServiceUnavailableError(message);
    default:
      return new AppError(message, { type });
  }
}
