import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, radius, spacing } from '../theme/tokens';

export interface GkFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function GkField({
  label,
  error,
  containerStyle,
  multiline,
  onFocus,
  onBlur,
  ...inputProps
}: GkFieldProps) {
  const { scheme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? scheme.red
    : focused
      ? scheme.primary
      : scheme.border2;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: scheme.text2 }]}>{label}</Text>
      ) : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={scheme.text3}
        style={[
          styles.input,
          {
            backgroundColor: scheme.surface2,
            borderColor,
            color: scheme.text,
          },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: font.uiSemibold,
    fontSize: fontSize.sm,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontFamily: font.ui,
    fontSize: fontSize.md,
  },
  multiline: {
    height: undefined,
    minHeight: 92,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
