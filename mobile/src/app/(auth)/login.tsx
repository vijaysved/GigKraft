// Login: email/password, plus a mock phone OTP flow (Phase 1: the backend
// returns the code in dev_code when MOCK_TWILIO is on).

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { GkButton } from '../../components/GkButton';
import { GkCard } from '../../components/GkCard';
import { GkField } from '../../components/GkField';
import { PhoneScaffold } from '../../components/PhoneScaffold';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize, spacing } from '../../theme/tokens';

type Mode = 'password' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { scheme } = useTheme();
  const { login, requestOtp, verifyOtp } = useAuth();
  const params = useLocalSearchParams<{ role?: string }>();
  const otpRole = params.role === 'pro' ? 'pro' : 'homeowner';

  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
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

  const handlePasswordLogin = () =>
    run(async () => {
      await login(email.trim(), password);
      router.replace('/');
    });

  const handleRequestOtp = () =>
    run(async () => {
      const result = await requestOtp(phone.trim());
      setOtpSent(true);
      setDevCode(result.dev_code ?? null);
    });

  const handleVerifyOtp = () =>
    run(async () => {
      await verifyOtp(phone.trim(), code.trim(), otpRole);
      router.replace('/');
    });

  return (
    <PhoneScaffold
      title="Sign in"
      headerLeft={
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: scheme.primary }]}>Back</Text>
        </Pressable>
      }
    >
      <View style={styles.modeRow}>
        <GkButton
          title="Email"
          variant={mode === 'password' ? 'light' : 'subtle'}
          onPress={() => setMode('password')}
          style={styles.modeButton}
        />
        <GkButton
          title="Phone (OTP)"
          variant={mode === 'otp' ? 'light' : 'subtle'}
          onPress={() => setMode('otp')}
          style={styles.modeButton}
        />
      </View>

      {mode === 'password' ? (
        <GkCard style={styles.form}>
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
            placeholder="Your password"
          />
          {error ? (
            <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
          ) : null}
          <GkButton
            title="Sign in"
            onPress={handlePasswordLogin}
            loading={busy}
            disabled={!email.trim() || !password}
          />
        </GkCard>
      ) : (
        <GkCard style={styles.form}>
          <GkField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1 555 000 1234"
          />
          {otpSent ? (
            <>
              <GkField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="6-digit code"
              />
              {devCode ? (
                <Text style={[styles.hint, { color: scheme.text3 }]}>
                  Mock mode: your code is {devCode}
                </Text>
              ) : null}
            </>
          ) : null}
          {error ? (
            <Text style={[styles.error, { color: scheme.red }]}>{error}</Text>
          ) : null}
          {otpSent ? (
            <GkButton
              title="Verify and sign in"
              onPress={handleVerifyOtp}
              loading={busy}
              disabled={!code.trim()}
            />
          ) : (
            <GkButton
              title="Send code"
              onPress={handleRequestOtp}
              loading={busy}
              disabled={!phone.trim()}
            />
          )}
        </GkCard>
      )}

      <GkButton
        title="New here? Create an account"
        variant="subtle"
        onPress={() => router.push('/(auth)/register')}
      />
    </PhoneScaffold>
  );
}

const styles = StyleSheet.create({
  backLink: {
    fontFamily: font.uiSemibold,
    fontSize: fontSize.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeButton: {
    flex: 1,
  },
  form: {
    gap: spacing.sm,
  },
  error: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.sm,
  },
  hint: {
    fontFamily: font.uiMedium,
    fontSize: fontSize.sm,
  },
});
