import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  correlationId: string;
  userId?: string;
  timestamp: number;
}

export function generateRequestId(): string {
  return uuidv4();
}

export function getCorrelationId(request: FastifyRequest): string {
  return (
    request.headers['x-correlation-id']?.toString() ||
    request.headers['x-request-id']?.toString() ||
    generateRequestId()
  );
}

export function getRequestContext(request: FastifyRequest): RequestContext {
  const requestId = request.id || generateRequestId();
  const correlationId = getCorrelationId(request);

  return {
    requestId,
    correlationId,
    timestamp: Date.now(),
  };
}

export function setResponseHeaders(reply: FastifyReply, context: RequestContext): FastifyReply {
  return reply
    .header('X-Request-ID', context.requestId)
    .header('X-Correlation-ID', context.correlationId)
    .header('X-Response-Time', Date.now().toString());
}

export function addContextHeaders(reply: FastifyReply, context: RequestContext): FastifyReply {
  return setResponseHeaders(reply, context);
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function parsePaginationParams(
  request: FastifyRequest,
  defaults: Partial<PaginationParams> = {},
): PaginationParams {
  const query = request.query as Record<string, any>;

  const page = parseInt(query.page?.toString() || defaults.page?.toString() || '1', 10);
  const limit = parseInt(query.limit?.toString() || defaults.limit?.toString() || '20', 10);
  const sortBy = query.sortBy?.toString() || defaults.sortBy;
  const sortOrder = (query.sortOrder?.toString() || defaults.sortOrder || 'asc') as 'asc' | 'desc';

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    sortBy,
    sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
  };
}

export function getBaseUrl(request: FastifyRequest): string {
  const protocol = request.protocol;
  const host = request.hostname;
  return `${protocol}://${host}`;
}

export function getUserAgent(request: FastifyRequest): string | undefined {
  return request.headers['user-agent'];
}

export function getIpAddress(request: FastifyRequest): string | undefined {
  return (
    request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    request.headers['x-real-ip']?.toString() ||
    request.ip
  );
}
