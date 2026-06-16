import {
  Alert,
  Box,
  Card,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconHammer, IconHome } from "@tabler/icons-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiError, patchMe } from "../api/endpoints";
import { GkLogo } from "../brand/GkLogo";
import { WallpaperBackground } from "../brand/WallpaperBackground";
import { useAuth } from "../auth/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

const ROLE_HOME: Record<string, string> = {
  pro: "/pro/leads",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

export function LoginPage() {
  const { status, user, loginWithGoogle, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickingRole, setPickingRole] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? null;

  if (status === "authenticated" && user && !pickingRole) {
    return <Navigate to={from ?? ROLE_HOME[user.role] ?? "/admin/dashboard"} replace />;
  }

  async function handleRolePick(role: "homeowner" | "pro") {
    setSubmitting(true);
    try {
      const updated = await patchMe({ role });
      updateUser(updated);
      navigate(role === "pro" ? "/pro/onboarding" : "/home/onboarding", { replace: true });
    } catch {
      setError("Failed to set role. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pickingRole) {
    return (
      <Box pos="relative" mih="100vh">
        <WallpaperBackground />
        <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
          <Stack w={420} maw="100%">
            <Group justify="center"><GkLogo height={40} /></Group>
            <Paper withBorder shadow="md" p="lg" radius="lg" bg="var(--gk-bg-surface)">
              <Stack>
                <Title order={4}>Welcome! I am a…</Title>
                <Text size="sm" c="dimmed">Choose your role to complete signup.</Text>
                {error && <Alert color="red" variant="light">{error}</Alert>}
                <Group grow>
                  <UnstyledButton onClick={() => handleRolePick("homeowner")} disabled={submitting}>
                    <Card withBorder radius="md" padding="md" style={{ cursor: "pointer", textAlign: "center" }}>
                      <Stack align="center" gap="xs">
                        <IconHome size={32} color="var(--gk-accent-secondary)" />
                        <Text fw={700}>Homeowner</Text>
                        <Text size="xs" c="dimmed">I need work done</Text>
                      </Stack>
                    </Card>
                  </UnstyledButton>
                  <UnstyledButton onClick={() => handleRolePick("pro")} disabled={submitting}>
                    <Card withBorder radius="md" padding="md" style={{ cursor: "pointer", textAlign: "center" }}>
                      <Stack align="center" gap="xs">
                        <IconHammer size={32} color="var(--gk-accent-primary)" />
                        <Text fw={700}>Handyman Pro</Text>
                        <Text size="xs" c="dimmed">I do the work</Text>
                      </Stack>
                    </Card>
                  </UnstyledButton>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={380} maw="100%">
          <Group justify="center"><GkLogo height={40} /></Group>
          <Paper withBorder shadow="md" p="lg" radius="lg" bg="var(--gk-bg-surface)">
            <Stack align="center" gap="md">
              <Title order={4}>Sign in to GigKraft</Title>
              {error && <Alert color="red" variant="light" w="100%">{error}</Alert>}
              <GoogleSignInButton
                label="signin_with"
                fullWidth
                onSuccess={async (idToken) => {
                  try {
                    const { created } = await loginWithGoogle(idToken);
                    if (created) setPickingRole(true);
                  } catch (err) {
                    setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
                  }
                }}
                onError={(msg) => setError(msg)}
              />
              <Text size="sm" ta="center">
                New? <Link to="/register">Create an account</Link>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
