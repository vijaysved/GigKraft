// M4 tab placeholder: real screen content arrives in Milestone 5.

import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, spacing } from '../theme/tokens';
import { GkBadge } from './GkBadge';
import { GkCard } from './GkCard';
import { PhoneScaffold } from './PhoneScaffold';

export interface PlaceholderScreenProps {
  title: string;
  description: string;
  headerRight?: React.ReactNode;
}

export function PlaceholderScreen({
  title,
  description,
  headerRight,
}: PlaceholderScreenProps) {
  const { scheme } = useTheme();

  return (
    <PhoneScaffold title={title} headerRight={headerRight}>
      <GkCard style={styles.card}>
        <GkBadge label="Milestone 5" tone="yellow" />
        <Text style={[styles.heading, { color: scheme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: scheme.text2 }]}>
          {description}
        </Text>
      </GkCard>
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  heading: {
    fontFamily: font.uiBold,
    fontSize: fontSize.lg,
  },
  body: {
    fontFamily: font.ui,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});
