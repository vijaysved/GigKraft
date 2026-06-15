// Entry / splash: role-based entry point. While the stored session is being
// restored we show a branded loading state; once resolved we either route
// into the correct shell (by JWT role) or offer the role-picker entry.

import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { GkButton } from '../components/GkButton';
import { useTheme } from '../theme/ThemeContext';
import { font, fontSize, spacing } from '../theme/tokens';

export default function SplashScreen() {
  const { status, role } = useAuth();
  const { scheme } = useTheme();
  const router = useRouter();

  if (status === 'signedIn') {
    if (role === 'pro') return <Redirect href="/(pro)/leads" />;
    if (role === 'homeowner') return <Redirect href="/(home)/discover" />;
    return <Redirect href="/web-admin" />;
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: scheme.bg }]}>
      <View style={styles.hero}>
        <Text style={[styles.brand, { color: scheme.text }]}>
          Gig<Text style={{ color: scheme.primary }}>Kraft</Text>
        </Text>
        <Text style={[styles.tagline, { color: scheme.text2 }]}>
          Trusted local pros, one node at a time.
        </Text>
      </View>

      {status === 'loading' ? (
        <View style={styles.actions}>
          <ActivityIndicator size="large" color={scheme.primary} />
        </View>
      ) : (
        <View style={styles.actions}>
          <GkButton
            title="I'm a Pro"
            onPress={() =>
              router.push({ pathname: '/(auth)/login', params: { role: 'pro' } })
            }
          />
          <GkButton
            title="I'm a Homeowner"
            variant="light"
            onPress={() =>
              router.push({
                pathname: '/(auth)/login',
                params: { role: 'homeowner' },
              })
            }
          />
          <GkButton
            title="Create an account"
            variant="subtle"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  brand: {
    fontFamily: font.uiBlack,
    fontSize: fontSize['3xl'],
  },
  tagline: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.md,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
});
