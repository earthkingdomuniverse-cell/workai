import { Role, Permission, Timestamps } from './common';

export interface User extends Timestamps {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  onboardingCompleted: boolean;
  trustScore?: number;
  profile?: UserProfile;
}

export interface UserProfile extends Timestamps {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  skills?: string[];
  goals?: string[];
}

export interface UserSession {
  userId: string;
  email: string;
  role: Role;
  token: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupInput extends UserCredentials {
  role?: Role;
}

export type LoginInput = UserCredentials;

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
}
