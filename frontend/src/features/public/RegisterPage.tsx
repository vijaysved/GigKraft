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
import { Link, Navigate, useNavigate } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

type Role = "pro" | "homeowner";

export function RegisterPage() {
  const { status, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
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
            <Stack>
              <Title order={4}>Create account</Title>
              <Text size="sm" c="dimmed">I am a…</Text>

              {error && <Alert color="red" variant="light">{error}</Alert>}

              <Group grow>
                <UnstyledButton onClick={() => setRole("pro")}>
                  <Card
                    withBorder
                    radius="md"
                    padding="md"
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                      borderColor: role === "pro" ? "var(--gk-accent-primary)" : undefined,
                      borderWidth: role === "pro" ? 2 : 1,
                      background: role === "pro"
                        ? "color-mix(in srgb, var(--gk-accent-primary) 8%, transparent)"
                        : undefined,
                    }}
                  >
                    <Stack align="center" gap="xs">
                      <IconHammer size={32} color="var(--gk-accent-primary)" />
                      <Text fw={700}>Handyman Pro</Text>
                      <Text size="xs" c="dimmed">I do the work</Text>
                    </Stack>
                  </Card>
                </UnstyledButton>

                <UnstyledButton onClick={() => setRole("homeowner")}>
                  <Card
                    withBorder
                    radius="md"
                    padding="md"
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                      borderColor: role === "homeowner" ? "var(--gk-accent-secondary)" : undefined,
                      borderWidth: role === "homeowner" ? 2 : 1,
                      background: role === "homeowner"
                        ? "color-mix(in srgb, var(--gk-accent-secondary) 8%, transparent)"
                        : undefined,
                    }}
                  >
                    <Stack align="center" gap="xs">
                      <IconHome size={32} color="var(--gk-accent-secondary)" />
                      <Text fw={700}>Homeowner</Text>
                      <Text size="xs" c="dimmed">I need work done</Text>
                    </Stack>
                  </Card>
                </UnstyledButton>
              </Group>

              <GoogleSignInButton
                label="signup_with"
                fullWidth
                onSuccess={async (idToken) => {
                  try {
                    await loginWithGoogle(idToken, role ?? "homeowner");
                    navigate(role === "pro" ? "/pro/onboarding" : "/home/discover", { replace: true });
                  } catch {
                    setError("Google sign-up failed. Please try again.");
                  }
                }}
                onError={(msg) => setError(msg)}
              />

              <Text size="sm" ta="center">
                Already have an account? <Link to="/login">Sign in</Link>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
