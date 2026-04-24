import { create } from 'zustand/index.js';
import { createJSONStorage, persist } from 'zustand/middleware.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

export type UserRole = 'member' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  onboardingCompleted: boolean;
  trustScore?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      initialized: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.login(email, password);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false,
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, role?: UserRole) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.signup(email, password, role);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            loading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            error: null,
          });
        }
      },

      restoreSession: async () => {
        const { token, user } = get();
        apiClient.setToken(token);

        if (token && user) {
          try {
            const response = await authService.getCurrentUser();
            if (response) {
              set({ user: response.user, initialized: true });
              return;
            }
          } catch (error) {
            try {
              const { refreshToken } = get();
              if (refreshToken) {
                const response = await authService.refreshToken(refreshToken);
                set({
                  token: response.token,
                  refreshToken: response.refreshToken,
                  user: response.user,
                  initialized: true,
                });
                return;
              }
            } catch (refreshError) {
              get().logout();
            }
          }
        }

        set({ initialized: true });
      },

      setOnboardingCompleted: async (completed: boolean) => {
        const { user } = get();
        if (user) {
          try {
            const updatedUser = await authService.updateOnboardingStatus(completed);
            if (updatedUser) {
              set({ user: updatedUser });
              return;
            }
          } catch (_error) {
            // fallback to local state update below
          }

          set({
            user: { ...user, onboardingCompleted: completed },
          });
        }
      },

      updateUser: (patch: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...patch } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

// Register interceptor for 401 Unauthorized
apiClient.setRefreshHandler(async () => {
  const { refreshToken, logout } = useAuthStore.getState();
  if (refreshToken) {
    try {
      const response = await authService.refreshToken(refreshToken);
      useAuthStore.setState({
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user,
      });
      return response.token;
    } catch (e) {
      // If refresh token fails, user must log in again
      await logout();
      return null;
    }
  }
  return null;
});

