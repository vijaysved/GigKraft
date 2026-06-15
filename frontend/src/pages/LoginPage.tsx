import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { ApiError } from "../api/endpoints";
import { GkLogo } from "../brand/GkLogo";
import { WallpaperBackground } from "../brand/WallpaperBackground";
import { useAuth } from "../auth/AuthContext";
import { MOCK_GOOGLE_OAUTH } from "../config";

const ROLE_HOME: Record<string, string> = {
  pro: "/pro/leads",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

export function LoginPage() {
  const { status, user, loginWithPassword, loginWithGoogleMock } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? null;

  if (status === "authenticated" && user) {
    return <Navigate to={from ?? ROLE_HOME[user.role] ?? "/admin/dashboard"} replace />;
  }

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithPassword(email, password);
      // redirect happens via the status === "authenticated" branch above
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    if (!email) {
      setError("Enter your email above, then use Google sign-in.");
      return;
    }
    setSubmitting(true);
    try {
      await loginWithGoogleMock(email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={420} maw="100%">
          <Group justify="center" align="center">
            <GkLogo height={40} />
          </Group>
          <Paper withBorder shadow="md" p="lg" radius="lg" bg="var(--gk-bg-surface)">
            <form onSubmit={handlePasswordLogin}>
              <Stack>
                <Title order={4}>Sign in to GigKraft</Title>
                {error && (
                  <Alert color="red" variant="light">{error}</Alert>
                )}
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Button type="submit" loading={submitting} fullWidth>
                  Sign in
                </Button>
                <Divider label="or" labelPosition="center" />
                <Button
                  variant="default"
                  fullWidth
                  disabled={submitting}
                  onClick={handleGoogleSignIn}
                >
                  Continue with Google{MOCK_GOOGLE_OAUTH ? " (mock)" : ""}
                </Button>
                {MOCK_GOOGLE_OAUTH && (
                  <Text size="xs" c="dimmed">
                    Phase 1 mock: enter an email and click Google. Role is determined by the account on the backend.
                  </Text>
                )}
                <Text size="sm" ta="center">
                  New? <Link to="/register">Create an account</Link>
                </Text>
                <Text size="sm" ta="center">
                  <Link to="/themes">Preview all 5 themes</Link>
                </Text>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
