import React from 'react';
import { TextField } from './TextField';
import type { TextInputProps } from 'react-native';

type MultilineFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function MultilineField(props: MultilineFieldProps) {
  return <TextField {...props} multiline textAlignVertical="top" />;
}

export default MultilineField;
