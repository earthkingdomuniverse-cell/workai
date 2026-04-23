import React from 'react';
import { TextField } from './TextField';

interface MultilineFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function MultilineField(props: MultilineFieldProps) {
  return <TextField {...props} multiline />;
}
