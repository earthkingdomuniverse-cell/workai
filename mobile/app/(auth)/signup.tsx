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

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => isValidEmail(email) && password.length >= 8 && password === confirmPassword && !loading,
    [email, password, confirmPassword, loading],
  );

  const handleSignup = async () => {
    clearError();
    setLocalError(null);

    if (!isValidEmail(email)) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await signup(email.trim().toLowerCase(), password, 'member');
      router.replace('/(onboarding)/intro');
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Start with a member account. Operator and admin access must be granted separately.
          </Text>
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
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {message ? <Text style={styles.errorText}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            disabled={!canSubmit}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log in</Text>
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
    flexWrap: 'wrap',
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
