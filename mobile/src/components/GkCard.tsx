import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { radius, shadow, spacing } from '../theme/tokens';

export interface GkCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GkCard({ children, onPress, style }: GkCardProps) {
  const { scheme } = useTheme();

  const surface: ViewStyle = {
    backgroundColor: scheme.surface,
    borderColor: scheme.border,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          surface,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
