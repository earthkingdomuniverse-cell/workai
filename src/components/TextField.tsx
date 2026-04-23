import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  maxLength?: number;
}

export function TextField({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.multiline,
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.surface.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  multiline: {
    minHeight: 100,
  },
  focused: {
    borderColor: theme.colors.primary[500],
  },
  error: {
    borderColor: theme.colors.error.main,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.light,
    marginTop: theme.spacing.xs,
  },
});
