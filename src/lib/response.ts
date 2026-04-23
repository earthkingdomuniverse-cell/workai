import { FastifyReply } from 'fastify';

export interface ApiResult<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    requestId?: string;
    timestamp?: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

function isReply(value: unknown): value is FastifyReply {
  return Boolean(
    value && typeof value === 'object' && 'send' in (value as Record<string, unknown>),
  );
}

export function successResponse<T>(
  reply: FastifyReply,
  data: T,
  meta?: Record<string, any>,
): FastifyReply;
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, any>,
): ApiResult<T>;
export function successResponse<T>(
  arg1: FastifyReply | T,
  arg2?: T | string,
  arg3?: Record<string, any>,
): FastifyReply | ApiResult<T> {
  if (isReply(arg1)) {
    const result: ApiResult<T> = {
      data: arg2 as T,
      meta: {
        ...arg3,
        timestamp: new Date().toISOString(),
      },
    };

    return arg1.send(result);
  }

  return {
    data: arg1 as T,
    meta: {
      ...(typeof arg2 === 'string' ? { message: arg2 } : {}),
      ...arg3,
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>,
): FastifyReply {
  const result: ApiResult<never> = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return reply.status(statusCode).send(result);
}

export function paginatedResponse<T>(
  reply: FastifyReply,
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  },
  extra?: Record<string, any>,
): FastifyReply {
  const result: ApiResult<T[]> = {
    data: items,
    meta: {
      ...pagination,
      ...extra,
      timestamp: new Date().toISOString(),
    },
  };

  return reply.send(result);
}

export function createdResponse<T>(reply: FastifyReply, data: T, location?: string): FastifyReply;
export function createdResponse<T>(data: T, message?: string): ApiResult<T>;
export function createdResponse<T>(
  arg1: FastifyReply | T,
  arg2?: T | string,
  arg3?: string,
): FastifyReply | ApiResult<T> {
  if (isReply(arg1)) {
    const result: ApiResult<T> = {
      data: arg2 as T,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    if (arg3) {
      arg1.header('Location', arg3);
    }

    return arg1.status(201).send(result);
  }

  return {
    data: arg1 as T,
    meta: {
      ...(typeof arg2 === 'string' ? { message: arg2 } : {}),
      timestamp: new Date().toISOString(),
    },
  };
}

export function noContentResponse(reply: FastifyReply): FastifyReply {
  return reply.status(204).send();
}
