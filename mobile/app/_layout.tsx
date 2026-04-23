import React, { useEffect, Component } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../theme';
import { useAuthStore } from '../src/store/auth-store';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.primary,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 24, color: theme.colors.error, marginBottom: 10 }}>
            ⚠️ Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center' }}>
            Please restart the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.primary[500]} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}
