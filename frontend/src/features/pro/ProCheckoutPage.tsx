import {
  Anchor,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck, IconLock, IconShield } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

const PRO_FEATURES = [
  "Unlimited verified Krafts",
  "Homeowner endorsements on every job",
  "Zipcode standing & performance insights",
  "Full data export — your work is yours",
  "Invoice verification & emergency dispatch (soon)",
];

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
      ...(init?.headers ?? {}),
    },
  });
}

export function ProCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = (searchParams.get("plan") ?? "monthly") as "monthly" | "annual";

  const price = plan === "annual" ? "$249.99" : "$24.99";
  const unit = plan === "annual" ? "/yr" : "/mo";
  const note = plan === "annual" ? "billed once a year · save 17%" : "billed monthly · recurring";
  const planLabel = plan === "annual" ? "Pro Vault Annual" : "Pro Vault Monthly";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Non-blocking guard: redirect if already subscribed (renders immediately, checks in background)
  useEffect(() => {
    authFetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((data: { has_active_subscription?: boolean }) => {
        if (data.has_active_subscription) {
          navigate("/pro/account?tab=billing", { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; detail?: string };
      if (!res.ok || !data.url) {
        setError(data.detail ?? "Could not start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={480} maw="100%" gap="md">

          <Group justify="center">
            <GkLogo height={36} />
          </Group>

          {/* Order summary */}
          <Card withBorder shadow="lg" radius="lg" p="xl" bg="var(--gk-bg-surface)">
            <Stack gap="md">
              <Stack gap={4}>
                <Group justify="space-between" align="center">
                  <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>GigKraft Pro</Title>
                  <Box
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "var(--gk-brand-gradient)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {plan}
                  </Box>
                </Group>
                <Text size="sm" c="dimmed">{planLabel}</Text>
              </Stack>

              <Divider />

              <Group justify="space-between" align="flex-end">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.06em" }}>Total today</Text>
                  <Text size="xs" c="dimmed">{note}</Text>
                </Stack>
                <Group gap={2} align="flex-end">
                  <Title style={{ fontSize: 36, lineHeight: 1, color: "var(--gk-accent-primary)" }}>{price}</Title>
                  <Text size="sm" c="dimmed" fw={600} pb={4}>{unit}</Text>
                </Group>
              </Group>

              <Divider />

              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>What's included</Text>
                {PRO_FEATURES.map((f) => (
                  <Group key={f} gap="xs" align="center">
                    <IconCheck size={14} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
                    <Text size="sm" fw={500}>{f}</Text>
                  </Group>
                ))}
              </Stack>

              {error && (
                <Text size="sm" c="red">{error}</Text>
              )}

              <Button
                size="lg"
                fullWidth
                radius="md"
                loading={loading}
                onClick={() => void startCheckout()}
                style={{ background: "var(--gk-accent-primary)", color: "#fff" }}
              >
                Continue to Payment →
              </Button>

              {/* Trust signals */}
              <Group justify="center" gap="lg" wrap="wrap">
                <Group gap={4}>
                  <IconLock size={13} color="var(--gk-text-muted)" />
                  <Text size="xs" c="dimmed">Secure via Stripe</Text>
                </Group>
                <Group gap={4}>
                  <IconShield size={13} color="var(--gk-text-muted)" />
                  <Text size="xs" c="dimmed">Cancel anytime</Text>
                </Group>
                <Text size="xs" c="dimmed">No per-lead fees</Text>
              </Group>
            </Stack>
          </Card>

          <Text ta="center" size="sm">
            <Anchor component="a" href="/pricing" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
              ← Back to pricing
            </Anchor>
          </Text>
        </Stack>
      </Center>
    </Box>
  );
}
