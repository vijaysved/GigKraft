import {
  Alert,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { ApiError } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

const ROLE_HOME: Record<string, string> = {
  member: "/member/welcome",
  pro: "/pro/leads",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

const HERO_BULLETS = [
  "Verified before/after portfolio — proof homeowners trust",
  "Zipcode standings so you see exactly where you rank",
  "One flat rate — no per-lead bidding, no hidden rake",
];

export function LoginPage() {
  const { status, user, loginWithGoogle } = useAuth();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? null;

  if (status === "authenticated" && user) {
    return <Navigate to={from ?? ROLE_HOME[user.role] ?? "/member/welcome"} replace />;
  }

  return (
    <Box style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left hero — visible on md+ */}
      <Box
        visibleFrom="md"
        style={{
          width: "46%",
          flexShrink: 0,
          background: "var(--mk-gradient, linear-gradient(135deg,#C42200 0%,#FF6B1A 55%,#84CC16 100%))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 52px",
        }}
      >
        <Stack gap="xl">
          <Text fw={900} style={{ fontSize: 26, color: "#fff", letterSpacing: -0.5 }}>
            gigKraft.com
          </Text>

          <Stack gap="sm">
            <Title
              order={2}
              style={{ color: "#fff", fontSize: "clamp(22px,2.8vw,36px)", lineHeight: 1.15, letterSpacing: -0.5 }}
            >
              Own the proof.<br />Own the work.
            </Title>
            <Text size="md" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }} maw={340}>
              The portfolio platform built for trade pros. Every finished job becomes a verified Kraft your clients can trust.
            </Text>
          </Stack>

          <Stack gap="sm">
            {HERO_BULLETS.map((b) => (
              <Group key={b} gap="sm" wrap="nowrap" align="flex-start">
                <Box
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}
                >
                  <IconCheck size={11} color="#fff" strokeWidth={3} />
                </Box>
                <Text size="sm" fw={600} style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
                  {b}
                </Text>
              </Group>
            ))}
          </Stack>

          <Text size="xs" style={{ color: "rgba(255,255,255,0.5)" }} mt="sm">
            Trusted by 3,100+ trade pros · 8,400+ verified Krafts
          </Text>
        </Stack>
      </Box>

      {/* Right — sign-in form */}
      <Box
        style={{
          flex: 1,
          background: "var(--gk-bg-canvas, #f8f9fa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <Stack w={380} maw="100%">
          {/* Brand on mobile */}
          <Group justify="center" hiddenFrom="md" mb="xs">
            <Text
              fw={900}
              size="xl"
              style={{
                background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6B1A,#84CC16))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              gigKraft.com
            </Text>
          </Group>

          <Paper withBorder shadow="sm" p="xl" radius="lg" bg="var(--gk-bg-surface)">
            <Stack align="center" gap="lg">
              <Stack gap={4} align="center">
                <Title order={3}>Welcome back</Title>
                <Text size="sm" c="dimmed">Sign in to your gigKraft.com account</Text>
              </Stack>

              {error && <Alert color="red" variant="light" w="100%">{error}</Alert>}

              <GoogleSignInButton
                label="signin_with"
                fullWidth
                onSuccess={async (idToken) => {
                  try {
                    await loginWithGoogle(idToken);
                    // Auth state change triggers the redirect at top of component
                  } catch (err) {
                    setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
                  }
                }}
                onError={(msg) => setError(msg)}
              />

              <Text size="sm" ta="center" c="dimmed">
                New to GigKraft?{" "}
                <Link to="/register" style={{ color: "var(--gk-accent-primary)", fontWeight: 600 }}>
                  Create a free account
                </Link>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
