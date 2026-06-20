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
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

type Role = "pro" | "homeowner";

export function RegisterPage() {
  const { status, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const intent = searchParams.get("intent") ?? "";
  const plan = searchParams.get("plan") ?? "monthly";
  const isSubscribeIntent = intent === "subscribe";

  const [role, setRole] = useState<Role | null>(isSubscribeIntent ? "pro" : null);
  const [error, setError] = useState<string | null>(null);

  // Keep role pinned to "pro" if subscribe intent is set
  useEffect(() => {
    if (isSubscribeIntent) setRole("pro");
  }, [isSubscribeIntent]);

  // Fix B7: if already authenticated, route to the right place instead of always "/"
  if (status === "authenticated") {
    if (isSubscribeIntent) {
      return <Navigate to={`/pro/checkout?plan=${plan}`} replace />;
    }
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

              {isSubscribeIntent ? (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">Signing up as a GigKraft Pro</Text>
                  <Card withBorder radius="md" padding="sm" style={{ borderColor: "var(--gk-accent-primary)", borderWidth: 2, background: "color-mix(in srgb, var(--gk-accent-primary) 6%, transparent)" }}>
                    <Group gap="sm">
                      <IconHammer size={22} color="var(--gk-accent-primary)" />
                      <Stack gap={0}>
                        <Text size="sm" fw={700}>Handyman Pro</Text>
                        <Text size="xs" c="dimmed">{plan === "annual" ? "Pro Vault Annual" : "Pro Vault Monthly"}</Text>
                      </Stack>
                    </Group>
                  </Card>
                </Stack>
              ) : (
                <>
                  <Text size="sm" c="dimmed">I am a…</Text>
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
                </>
              )}

              {error && <Alert color="red" variant="light">{error}</Alert>}

              <GoogleSignInButton
                label="signup_with"
                fullWidth
                onSuccess={async (idToken) => {
                  try {
                    const effectiveRole = role ?? "homeowner";
                    await loginWithGoogle(idToken, effectiveRole);
                    if (isSubscribeIntent && effectiveRole === "pro") {
                      navigate(`/pro/checkout?plan=${plan}`, { replace: true });
                    } else if (effectiveRole === "pro") {
                      navigate("/pro/onboarding", { replace: true });
                    } else {
                      navigate("/home/discover", { replace: true });
                    }
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
