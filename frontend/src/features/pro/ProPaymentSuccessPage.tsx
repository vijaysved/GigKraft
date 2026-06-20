import {
  Box,
  Button,
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
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

type PageState = "polling" | "confirmed" | "timeout";

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2000;
const REDIRECT_DELAY_MS = 2000;

async function checkSubscription(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
  });
  if (!res.ok) return false;
  const data = await res.json() as { has_active_subscription?: boolean };
  return Boolean(data.has_active_subscription);
}

export function ProPaymentSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>("polling");
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function poll() {
      checkSubscription()
        .then((active) => {
          if (active) {
            setState("confirmed");
            // Smart redirect: if onboarding hasn't been done (no first_name), go to onboarding
            const dest = user?.first_name ? "/pro/dashboard" : "/pro/onboarding";
            pollTimer.current = setTimeout(() => navigate(dest, { replace: true }), REDIRECT_DELAY_MS);
          } else if (pollCount.current >= MAX_POLLS - 1) {
            setState("timeout");
          } else {
            pollCount.current += 1;
            pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        })
        .catch(() => {
          if (pollCount.current >= MAX_POLLS - 1) {
            setState("timeout");
          } else {
            pollCount.current += 1;
            pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        });
    }

    pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [navigate, user?.first_name]);

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Card withBorder shadow="lg" radius="lg" p={48} bg="var(--gk-bg-surface)" maw={440} w="100%">
          <Stack align="center" gap="lg" ta="center">
            <GkLogo height={32} />

            {state === "polling" && (
              <>
                <Loader size="lg" color="var(--gk-accent-primary)" />
                <Stack gap={4} align="center">
                  <Title order={4}>Activating your account…</Title>
                  <Text size="sm" c="dimmed">Confirming your payment with Stripe. This takes just a moment.</Text>
                </Stack>
              </>
            )}

            {state === "confirmed" && (
              <>
                <ThemeIcon
                  size={80}
                  radius="xl"
                  style={{ background: "var(--gk-brand-gradient)" }}
                >
                  <IconCheck size={40} color="#fff" />
                </ThemeIcon>
                <Stack gap={4} align="center">
                  <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Payment successful!</Title>
                  <Text size="sm" c="dimmed">You're now a GigKraft Pro.</Text>
                  <Text size="xs" c="dimmed">Redirecting you now…</Text>
                </Stack>
              </>
            )}

            {state === "timeout" && (
              <>
                <Stack gap={4} align="center">
                  <Title order={4}>Payment received</Title>
                  <Text size="sm" c="dimmed">
                    Your payment went through. Your account may take a moment to activate — check back shortly.
                  </Text>
                </Stack>
                <Group gap="sm">
                  <Button
                    variant="light"
                    onClick={() => navigate("/pro/dashboard", { replace: true })}
                  >
                    Go to Dashboard →
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => navigate("/pro/account?tab=billing", { replace: true })}
                  >
                    View billing
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>
      </Center>
    </Box>
  );
}
