// Raised primary center button used as the middle tab in both shells
// (+ Add Kraft for pros, Emergency for homeowners).

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { shadow } from '../theme/tokens';

export interface RaisedTabButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accessibilityLabel: string;
  onPress?: () => void;
}

export function RaisedTabButton({
  icon,
  color,
  accessibilityLabel,
  onPress,
}: RaisedTabButtonProps) {
  const { scheme } = useTheme();

  return (
    <View style={styles.slot} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: color, borderColor: scheme.bg },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name={icon} size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
