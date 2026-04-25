import React from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

type MultilineFieldProps = TextFieldProps;

export function MultilineField(props: MultilineFieldProps) {
  return <TextField {...props} multiline textAlignVertical="top" />;
}

export default MultilineField;
