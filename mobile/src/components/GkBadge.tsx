import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, radius, spacing } from '../theme/tokens';

export type GkBadgeTone = 'blue' | 'green' | 'red' | 'yellow' | 'gray';

export interface GkBadgeProps {
  label: string;
  tone?: GkBadgeTone;
  style?: ViewStyle;
}

export function GkBadge({ label, tone = 'blue', style }: GkBadgeProps) {
  const { scheme } = useTheme();

  const tones: Record<GkBadgeTone, { bg: string; fg: string }> = {
    blue: { bg: scheme.tint, fg: scheme.tintText },
    green: { bg: scheme.greenBg, fg: scheme.green },
    red: { bg: scheme.redBg, fg: scheme.red },
    yellow: { bg: scheme.yellowBg, fg: scheme.yellow },
    gray: { bg: scheme.surface2, fg: scheme.text2 },
  };

  const { bg, fg } = tones[tone];

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: font.uiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
  },
});
