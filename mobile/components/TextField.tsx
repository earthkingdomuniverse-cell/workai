import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function TextField({ label, placeholder, value, onChange, error }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        value={value}
        onChangeText={onChange}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default TextField;

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface.input,
    borderColor: theme.colors.surface.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  error: {
    color: theme.colors.error.light,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
