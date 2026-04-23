import { Role } from './common';

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  deviceInfo?: {
    deviceId?: string;
    deviceName?: string;
    platform?: 'ios' | 'android' | 'web' | 'desktop';
    appVersion?: string;
  };
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface SessionToken {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}
