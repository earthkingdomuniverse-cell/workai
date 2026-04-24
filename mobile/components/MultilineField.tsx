import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

type MultilineFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
};

export function MultilineField({
  label,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
}: MultilineFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        multiline
        numberOfLines={5}
        maxLength={maxLength}
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        textAlignVertical="top"
        value={value}
        onChangeText={onChange}
      />
      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : <View />}
        {typeof maxLength === 'number' ? (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default MultilineField;

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
    minHeight: 120,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error.light,
    fontSize: theme.typography.fontSize.xs,
  },
  counter: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.xs,
  },
});
