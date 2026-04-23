import { ENABLE_MOCK_MODE } from '../constants/config';
import { apiClient } from './apiClient';
import { storage } from '../utils/storage';

export interface User {
  id: string;
  email: string;
  role: 'member' | 'operator' | 'admin';
  onboardingCompleted: boolean;
  trustScore?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', {
        email,
        password,
      });
      const payload = response.data;
      await this.persistAuth(payload);
      return payload;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        const fallback = this.createMockAuthResponse(email, 'member');
        await this.persistAuth(fallback);
        return fallback;
      }
      throw error;
    }
  }

  async signup(
    email: string,
    password: string,
    role: 'member' | 'operator' | 'admin' = 'member',
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/signup', {
        email,
        password,
        role,
      });
      const payload = response.data;
      await this.persistAuth(payload);
      return payload;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        const fallback = this.createMockAuthResponse(email, role, false);
        await this.persistAuth(fallback);
        return fallback;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    apiClient.setToken(null);
    await storage.clearAuth();
  }

  async getCurrentUser(): Promise<{ user: User } | null> {
    try {
      const response = await apiClient.get<{ data: { user: User } }>('/auth/me');
      if (response.data?.user) {
        await storage.setUserData(response.data.user);
        return response.data;
      }
      return null;
    } catch (_error) {
      if (ENABLE_MOCK_MODE) {
        const user =
          (await storage.getUserData()) ||
          this.createMockAuthResponse('mock@example.com', 'member').user;
        return { user };
      }
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/refresh', {
        refreshToken,
      });
      const payload = response.data;
      await this.persistAuth(payload);
      return payload;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        const user =
          (await storage.getUserData()) ||
          this.createMockAuthResponse('mock@example.com', 'member').user;
        const fallback = this.createMockAuthResponse(
          user.email,
          user.role,
          user.onboardingCompleted,
        );
        await this.persistAuth(fallback);
        return fallback;
      }
      throw error;
    }
  }

  async updateOnboardingStatus(onboardingCompleted: boolean): Promise<User | null> {
    try {
      const response = await apiClient.patch<{ data: { user: User } }>('/auth/me/onboarding', {
        onboardingCompleted,
      });
      if (response.data?.user) {
        await storage.setUserData(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        const existing = await storage.getUserData();
        if (existing) {
          const updated = { ...existing, onboardingCompleted };
          await storage.setUserData(updated);
          return updated;
        }
      }
      throw error;
    }
  }

  private async persistAuth(response: AuthResponse): Promise<void> {
    apiClient.setToken(response.token);
    await storage.setToken(response.token);
    await storage.setRefreshToken(response.refreshToken);
    await storage.setUserData(response.user);
  }

  private createMockAuthResponse(
    email: string,
    role: 'member' | 'operator' | 'admin',
    onboardingCompleted: boolean = true,
  ): AuthResponse {
    return {
      user: {
        id: `mock_${role}_user`,
        email,
        role,
        onboardingCompleted,
        trustScore: role === 'admin' ? 99 : role === 'operator' ? 92 : 80,
      },
      token: `mock-token-${role}`,
      refreshToken: `mock-refresh-${role}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
  }
}

export const authService = new AuthService();
