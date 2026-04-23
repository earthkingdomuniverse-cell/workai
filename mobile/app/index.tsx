import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onboardingCompleted) {
    return <Redirect href="/(onboarding)/intro" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
