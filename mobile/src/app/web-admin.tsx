// Shown to node_manager accounts: that role is served by the web admin,
// not the mobile app.

import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { GkBadge } from '../components/GkBadge';
import { GkButton } from '../components/GkButton';
import { GkCard } from '../components/GkCard';
import { PhoneScaffold } from '../components/PhoneScaffold';
import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, spacing } from '../theme/tokens';

export default function WebAdminScreen() {
  const { scheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <PhoneScaffold title="GigKraft">
      <GkCard style={styles.card}>
        <GkBadge label="Node Manager" tone="blue" />
        <Text style={[styles.heading, { color: scheme.text }]}>
          This account uses the web admin
        </Text>
        <Text style={[styles.body, { color: scheme.text2 }]}>
          {user?.email ? `${user.email} is` : 'You are'} signed in as a node
          manager. Node management lives in the GigKraft web admin -- open it
          in your browser to manage your node, pros, and dispatches.
        </Text>
        <GkButton title="Sign out" variant="default" onPress={logout} />
      </GkCard>
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
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
