import React from 'react';
import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { font } from '../theme/tokens';

export interface GkAvatarProps {
  name: string;
  uri?: string;
  size?: number;
  style?: ViewStyle & ImageStyle;
}

// Stable hue derived from the name so the same person always gets the
// same fallback color.
function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function GkAvatar({ name, uri, size = 40, style }: GkAvatarProps) {
  const { scheme } = useTheme();
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[dim, style]} />;
  }

  const hue = hueFromName(name);
  const bg = scheme.dark
    ? `hsl(${hue}, 45%, 28%)`
    : `hsl(${hue}, 60%, 88%)`;
  const fg = scheme.dark
    ? `hsl(${hue}, 60%, 80%)`
    : `hsl(${hue}, 55%, 32%)`;

  return (
    <View style={[styles.fallback, dim, { backgroundColor: bg }, style]}>
      <Text
        style={{
          fontFamily: font.uiBold,
          fontSize: Math.round(size * 0.38),
          color: fg,
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
