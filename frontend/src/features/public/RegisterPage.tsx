import {
  Alert,
  Box,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconHammer, IconHome } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { claimAnonymousLead, createLead } from "../../api/endpoints";
import { GkLogo } from "../../brand/GkLogo";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

interface PendingLead {
  anon_lead_id: number | null;
  pro_id: number;
  job_title: string;
  detail: string;
}

function popPendingLead(): PendingLead | null {
  try {
    const raw = sessionStorage.getItem("gk_pending_lead");
    if (!raw) return null;
    sessionStorage.removeItem("gk_pending_lead");
    return JSON.parse(raw) as PendingLead;
  } catch {
    return null;
  }
}

async function processPendingLead(pending: PendingLead): Promise<void> {
  if (pending.anon_lead_id) {
    try {
      await claimAnonymousLead(pending.anon_lead_id);
      return;
    } catch {
      // anon lead gone — fall through to create a fresh one
    }
  }
  await createLead({
    pro_id: pending.pro_id,
    job_title: pending.job_title,
    detail: pending.detail,
    thread_type: "lead",
  });
}

type Role = "pro" | "homeowner";

const HERO_BULLETS = [
  "Verified before/after portfolio homeowners trust",
  "Zipcode standings — see exactly where you rank",
  "One flat rate — no per-lead bidding, no hidden rake",
];

export function RegisterPage() {
  const { status, user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const intent = searchParams.get("intent") ?? "";
  const plan = searchParams.get("plan") ?? "monthly";
  const claimLeadId = searchParams.get("claim") ?? sessionStorage.getItem("gk_claim_lead");
  const isSubscribeIntent = intent === "subscribe";

  const [role, setRole] = useState<Role | null>(isSubscribeIntent ? "pro" : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSubscribeIntent) setRole("pro");
  }, [isSubscribeIntent]);

  if (status === "authenticated") {
    if (isSubscribeIntent) {
      return <Navigate to="/subscribe" replace />;
    }
    if (user?.role === "homeowner") {
      return <Navigate to="/home/discover" replace />;
    }
    return <Navigate to="/member/welcome" replace />;
  }

  return (
    <Box style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      {/* Left hero panel */}
      <Box
        visibleFrom="md"
        style={{
          width: "46%",
          flexShrink: 0,
          background: "var(--mk-gradient, linear-gradient(135deg,#C42200 0%,#FF6B1A 55%,#84CC16 100%))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          overflow: "hidden",
        }}
      >
        {/* Logo at 50% */}
        <Link to="/" style={{ display: "inline-block" }}>
          <Box
            component="img"
            src="/brand/gigKraftLogo.png"
            alt="gigKraft.com"
            style={{ display: "block", maxWidth: "50%", height: "auto" }}
          />
        </Link>

        <Stack gap="xl">
          <Stack gap="sm">
            <Title
              order={2}
              style={{ color: "#fff", fontSize: "clamp(22px,2.8vw,36px)", lineHeight: 1.15, letterSpacing: -0.5 }}
            >
              Own the proof.<br />Own the work.
            </Title>
            <Text size="md" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }} maw={340}>
              Build a verified portfolio of finished jobs that clients can trust — and see exactly how you stack up in your zipcode.
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

          <Text size="xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Trusted by 3,100+ trade pros · 8,400+ verified Krafts
          </Text>
        </Stack>

        <Link
          to="/"
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to home
        </Link>
      </Box>

      {/* Right — create account */}
      <Box
        style={{
          flex: 1,
          background: "var(--gk-bg-canvas, #f8f9fa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          overflowY: "auto",
        }}
      >
        <Stack w={420} maw="100%">
          {/* Mobile: logo + home link */}
          <Group justify="space-between" hiddenFrom="md" mb="xs" align="center">
            <Link to="/" style={{ display: "inline-block" }}>
              <GkLogo height={48} />
            </Link>
            <Link to="/" style={{ color: "var(--gk-text-muted, #868e96)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              ← Home
            </Link>
          </Group>

          <Paper
            withBorder
            shadow="md"
            radius="lg"
            style={{ overflow: "hidden", borderColor: "var(--gk-accent-primary)", borderWidth: 1.5 }}
          >
            {/* Gradient header */}
            <Box
              style={{
                background: "var(--mk-gradient, linear-gradient(135deg,#C42200 0%,#FF6B1A 55%,#84CC16 100%))",
                padding: "14px 24px",
              }}
            >
              <Title order={4} style={{ color: "#fff", letterSpacing: -0.3 }}>
                Create account
              </Title>
            </Box>

            {/* Form body */}
            <Box p="lg" bg="var(--gk-bg-surface)">
              <Stack>
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
                      if (isSubscribeIntent) {
                        await loginWithGoogle(idToken, "member");
                        navigate("/subscribe", { replace: true });
                      } else if (role === "homeowner") {
                        await loginWithGoogle(idToken, "homeowner");
                        const pending = popPendingLead();
                        if (pending) {
                          try { await processPendingLead(pending); } catch { /* best-effort */ }
                          navigate("/home/messages", { replace: true });
                        } else {
                          navigate("/home/discover", { replace: true });
                        }
                      } else {
                        await loginWithGoogle(idToken, "member");
                        if (claimLeadId) {
                          // ClaimLeadPage will attempt the explicit link and handle no_pro_profile
                          navigate(`/claim/${claimLeadId}`, { replace: true });
                        } else {
                          navigate("/member/welcome", { replace: true });
                        }
                      }
                    } catch {
                      setError("Google sign-up failed. Please try again.");
                    }
                  }}
                  onError={(msg) => setError(msg)}
                />

                <Text size="sm" ta="center">
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "var(--gk-accent-primary)", fontWeight: 600 }}>Sign in</Link>
                </Text>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
