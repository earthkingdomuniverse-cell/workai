import { Permission } from '../../types';

export type UserRole = 'member' | 'operator' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  onboardingCompleted: boolean;
  trustScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface SignupInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface PasswordHash {
  hash: string;
  salt: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}
