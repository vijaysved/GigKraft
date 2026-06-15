// Shared account screen body for both shells in M4: profile summary,
// theme picker (persisted), and sign out. Expanded in Milestone 5.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { THEME_LABELS, THEME_NAMES, ThemeName } from '../theme/themes';
import { font, fontSize, spacing } from '../theme/tokens';
import { GkAvatar } from './GkAvatar';
import { GkBadge } from './GkBadge';
import { GkButton } from './GkButton';
import { GkCard } from './GkCard';
import { GkSelect } from './GkSelect';
import { PhoneScaffold } from './PhoneScaffold';

export function AccountPanel({ children }: { children?: React.ReactNode }) {
  const { scheme, themeName, setTheme } = useTheme();
  const { user, role, logout } = useAuth();

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email ||
    'GigKraft user';

  return (
    <PhoneScaffold title="Account">
      <GkCard style={styles.profile}>
        <GkAvatar name={fullName} size={56} />
        <View style={styles.profileText}>
          <Text style={[styles.name, { color: scheme.text }]}>{fullName}</Text>
          <Text style={[styles.meta, { color: scheme.text3 }]}>
            {user?.email ?? user?.phone ?? ''}
          </Text>
          {role ? <GkBadge label={role} tone="blue" /> : null}
        </View>
      </GkCard>

      <GkCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: scheme.text }]}>
          Appearance
        </Text>
        <GkSelect<ThemeName>
          label="Theme"
          value={themeName}
          onChange={setTheme}
          options={THEME_NAMES.map((name) => ({
            value: name,
            label: THEME_LABELS[name],
          }))}
        />
      </GkCard>

      {children}

      <GkButton title="Sign out" variant="default" onPress={logout} />
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: font.uiBold,
    fontSize: fontSize.lg,
  },
  meta: {
    fontFamily: font.ui,
    fontSize: fontSize.sm,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: font.uiBold,
    fontSize: fontSize.md,
  },
});
