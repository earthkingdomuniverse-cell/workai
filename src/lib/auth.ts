import { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../modules/auth/token';
import type { Role } from '../types/common';
import { AppError } from './errors';

export interface AuthContext {
  userId: string;
  email: string;
  role: Role;
  permissions: string[];
}

export async function authenticate(
  request: FastifyRequest,
  _reply?: FastifyReply,
): Promise<AuthContext> {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    const guest: AuthContext = {
      userId: 'guest_user',
      email: 'guest@example.com',
      role: 'member',
      permissions: ['read'],
    };
    (request as any).user = guest;
    return guest;
  }

  const token = header.slice(7);
  const payload = await verifyAccessToken(token);
  const user: AuthContext = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    permissions:
      payload.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
  };
  (request as any).user = user;
  return user;
}

export async function authorize(
  request: FastifyRequest,
  reply: FastifyReply,
  roles: Role[],
): Promise<void> {
  const user =
    ((request as any).user as AuthContext | undefined) || (await authenticate(request, reply));

  if (!roles.includes(user.role)) {
    throw new AppError('Member role is not allowed to access this resource', {
      code: 'ACCESS_DENIED',
      statusCode: 403,
    });
  }
}
