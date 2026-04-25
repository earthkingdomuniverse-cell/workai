import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type TextFieldProps = Omit<TextInputProps, 'onChange'> & {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
};

export function TextField({ label, error, style, onChange, onChangeText, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        onChangeText={onChangeText || onChange}
        style={[styles.input, style]}
        placeholderTextColor={colors.textSecondary}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default TextField;

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    padding: spacing.md,
    ...typography.body,
  },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});
