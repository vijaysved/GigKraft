// Registration with a role picker (pro or homeowner). Node managers are
// directed to the web admin and register there.

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ApiError } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { GkSelect } from '../../components/GkSelect';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

type PickableRole = 'pro' | 'homeowner';

export default function RegisterScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const { register } = useAuth();

  const [role, setRole] = useState<PickableRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    role !== null && email.trim().length > 0 && password.length >= 8;

  async function handleRegister() {
    if (!role) return;
    setBusy(true);
    setError(null);
    try {
      await register({
        email: email.trim(),
        password,
        role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      router.replace('/');
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Something went wrong.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneScaffold
      title="Create account"
      headerLeft={
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: scheme.primary }]}>Back</Text>
        </Pressable>
      }
    >
      <GkCard style={styles.form}>
        <GkSelect<PickableRole>
          label="I am a..."
          placeholder="Choose your role"
          value={role}
          onChange={setRole}
          options={[
            { value: 'pro', label: 'Pro (I do the work)' },
            { value: 'homeowner', label: 'Homeowner (I need work done)' },
          ]}
        />
        <GkField
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="given-name"
          placeholder="First name"
        />
        <GkField
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          autoComplete="family-name"
          placeholder="Last name"
        />
        <GkField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <GkField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
        />
        {error ? (
          <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
        ) : null}
        <GkButton
          title="Create account"
          onPress={handleRegister}
          loading={busy}
          disabled={!canSubmit}
        />
      </GkCard>

      <Text style={[styles.note, { color: scheme.text3 }]}>
        Managing a node? Node managers use the GigKraft web admin instead of
        this app.
      </Text>
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  backLink: {
    fontFamily: font.uiSemibold,
    fontSize: fontSize.md,
  },
  form: {
    gap: spacing.sm,
  },
  error: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.sm,
  },
  note: {
    fontFamily: font.ui,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
