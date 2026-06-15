import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, radius, spacing } from '../theme/tokens';

export type GkButtonVariant =
  | 'filled'
  | 'light'
  | 'default'
  | 'subtle'
  | 'danger';

export interface GkButtonProps {
  title: string;
  onPress?: () => void;
  variant?: GkButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function GkButton({
  title,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  style,
}: GkButtonProps) {
  const { scheme } = useTheme();

  const container: ViewStyle = {};
  const label: TextStyle = {};

  switch (variant) {
    case 'filled':
      container.backgroundColor = scheme.primary;
      label.color = scheme.onPrimary;
      break;
    case 'light':
      container.backgroundColor = scheme.tint;
      label.color = scheme.tintText;
      break;
    case 'default':
      container.backgroundColor = scheme.surface;
      container.borderWidth = 1;
      container.borderColor = scheme.border2;
      label.color = scheme.text;
      break;
    case 'subtle':
      container.backgroundColor = 'transparent';
      label.color = scheme.primary;
      break;
    case 'danger':
      container.backgroundColor = scheme.red;
      label.color = scheme.onPrimary;
      break;
  }

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        container,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={label.color as string} />
      ) : (
        <Text style={[styles.label, label]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: font.uiSemibold,
    fontSize: fontSize.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
