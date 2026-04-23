import { useAuthStore } from '../store/auth-store';

export function useAuthRedirect() {
  const { user, token, initialized } = useAuthStore();
  const isAuthenticated = Boolean(user && token);

  const shouldRedirectToAuth = (): boolean => {
    if (!initialized) return false;
    return !isAuthenticated;
  };

  const shouldRedirectToOnboarding = (): boolean => {
    if (!initialized || !isAuthenticated) return false;
    return !user?.onboardingCompleted;
  };

  const shouldShowAdminTab = (): boolean => {
    return user?.role === 'operator' || user?.role === 'admin';
  };

  const getInitialRoute = (): string => {
    if (!initialized) return '/(auth)/login';

    if (!isAuthenticated) {
      return '/(auth)/login';
    }

    if (!user?.onboardingCompleted) {
      return '/(onboarding)/intro';
    }

    return '/(tabs)/home';
  };

  return {
    shouldRedirectToAuth,
    shouldRedirectToOnboarding,
    shouldShowAdminTab,
    getInitialRoute,
  };
}
