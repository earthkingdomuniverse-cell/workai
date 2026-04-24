import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useAuthStore } from '../../src/store/auth-store';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => isValidEmail(email) && password.length >= 6 && !loading,
    [email, password, loading],
  );

  const handleLogin = async () => {
    clearError();
    setLocalError(null);

    if (!isValidEmail(email)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      const user = useAuthStore.getState().user;
      router.replace(user?.onboardingCompleted ? '/(tabs)/home' : '/(onboarding)/intro');
    } catch (_error) {
      // Store error is rendered below.
    }
  };

  const message = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.badge}>WorkAI</Text>
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Continue managing offers, requests, deals, and AI work matching.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {message ? <Text style={styles.errorText}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            disabled={!canSubmit}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to WorkAI?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: theme.colors.background.primary },
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: { marginBottom: theme.spacing.xl * 1.5 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.full,
    color: theme.colors.primary[400],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  form: { gap: theme.spacing.md },
  field: { gap: theme.spacing.sm },
  label: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  input: {
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error.light,
    fontSize: theme.typography.fontSize.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: theme.colors.primary[950],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  footerLink: {
    color: theme.colors.primary[400],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
