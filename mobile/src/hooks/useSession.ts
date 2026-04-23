import { useAuthStore } from '../store/auth-store';
import { useAuthRedirect } from './useAuthRedirect';

export function useSession(initialRoute: string = '/(tabs)/home') {
  const { token, initialized, user } = useAuthStore();
  const { getInitialRoute } = useAuthRedirect();
  const isAuthenticated = Boolean(token && user);

  const session = {
    isAuthenticated,
    initialized,
    user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator' || user?.role === 'admin',
    onboardingCompleted: user?.onboardingCompleted || false,
  };

  const redirect = {
    to: getInitialRoute(),
    showAdminTab: session.isOperator,
  };

  return {
    session,
    redirect,
  };
}
