import {
  Alert,
  Box,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

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

const STRIPE_CONFIG = {
  test: {
    tableId: import.meta.env.VITE_STRIPE_TEST_PRICING_TABLE_ID as string,
    publishableKey: import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY as string,
  },
  live: {
    tableId: import.meta.env.VITE_STRIPE_LIVE_PRICING_TABLE_ID as string,
    publishableKey: import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY as string,
  },
};

function StripePricingTable({ mode, userId }: { mode: string; userId?: number }) {
  const cfg = STRIPE_CONFIG[mode as "test" | "live"] ?? STRIPE_CONFIG.live;
  if (!cfg.tableId || !cfg.publishableKey) {
    return (
      <Alert color="yellow" variant="light">
        Stripe pricing table not configured for <strong>{mode}</strong> mode.
        {mode === "live"
          ? " Add VITE_STRIPE_LIVE_PRICING_TABLE_ID and VITE_STRIPE_LIVE_PUBLISHABLE_KEY to your Vercel environment variables."
          : " Add VITE_STRIPE_TEST_PRICING_TABLE_ID and VITE_STRIPE_TEST_PUBLISHABLE_KEY to your .env file."}
      </Alert>
    );
  }
  return (
    <stripe-pricing-table
      pricing-table-id={cfg.tableId}
      publishable-key={cfg.publishableKey}
      client-reference-id={userId ? String(userId) : undefined}
    />
  );
}

interface SubStatus {
  has_active_subscription: boolean;
  stripe_mode: string;
  user_id: number;
}

export function SubscribePage() {
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/billing/subscription`, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
    })
      .then((r) => r.json())
      .then((d) => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box pos="relative" mih="100vh">
        <WallpaperBackground />
        <Center mih="100vh" pos="relative" style={{ zIndex: 1 }}>
          <Loader size="lg" color="white" />
        </Center>
      </Box>
    );
  }

  if (status?.has_active_subscription) {
    return <Navigate to="/pro/account?tab=billing" replace />;
  }

  const mode = status?.stripe_mode ?? "live";
  const userId = status?.user_id;

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" px="md" py="xl" pos="relative" style={{ zIndex: 1 }}>
        <Stack gap="lg" w="100%" maw={900} align="center">
          <GkLogo height={36} />

          <Stack gap={4} align="center">
            <Title order={2} ta="center" style={{ color: "white" }}>
              Upgrade to GigKraft Pro
            </Title>
            <Text ta="center" size="sm" style={{ color: "rgba(255,255,255,0.7)" }} maw={480}>
              Join pros who win more work, build homeowner trust, and grow their reputation.
            </Text>
          </Stack>

          <Group gap="lg" justify="center" wrap="wrap">
            {PRO_FEATURES.map((f) => (
              <Group key={f} gap={6} wrap="nowrap">
                <ThemeIcon
                  size="xs"
                  radius="xl"
                  style={{ background: "var(--gk-brand-gradient)", flexShrink: 0 }}
                >
                  <IconCheck size={10} color="#fff" />
                </ThemeIcon>
                <Text size="sm" style={{ color: "rgba(255,255,255,0.85)" }}>{f}</Text>
              </Group>
            ))}
          </Group>

          <Card withBorder radius="lg" p="xl" bg="white" w="100%" shadow="lg">
            <StripePricingTable mode={mode} userId={userId} />
          </Card>
        </Stack>
      </Center>
    </Box>
  );
}
