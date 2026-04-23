import { ApiResult } from '../types';

export function successResponse<T>(data: T): ApiResult<T> {
  return { data };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
): ApiResult<never> {
  return { error: { code, message, details } };
}

export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
): Error {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).details = details;
  return error;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '');
}

export function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

export function parseNumber(value: string | number | undefined, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}
