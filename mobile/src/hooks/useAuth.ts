import { useAuthStore } from '../store/auth-store';

export function useAuth() {
  const {
    user,
    token,
    refreshToken,
    loading,
    error,
    login,
    signup,
    logout,
    restoreSession,
    setOnboardingCompleted,
    clearError,
  } = useAuthStore();

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator' || user?.role === 'admin';

  return {
    user,
    token,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isOperator,
    login,
    signup,
    logout,
    restoreSession,
    setOnboardingCompleted,
    clearError,
  };
}
