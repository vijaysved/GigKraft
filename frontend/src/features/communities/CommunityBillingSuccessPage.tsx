import { Center, Loader, Stack, Text, Title } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { communityFetch } from "./hooks/useCommunity";
import type { CommunitySubscriptionStatusOut } from "./types";

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2000;
const REDIRECT_DELAY_MS = 1500;

export function CommunityBillingSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function poll() {
      communityFetch("/api/communities/subscription")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: CommunitySubscriptionStatusOut | null) => {
          if (data?.has_active_subscription) {
            setConfirmed(true);
            pollTimer.current = setTimeout(
              () => navigate(`/us/${slug}/community`, { replace: true }),
              REDIRECT_DELAY_MS,
            );
          } else if (pollCount.current >= MAX_POLLS - 1) {
            navigate(`/us/${slug}/community`, { replace: true });
          } else {
            pollCount.current += 1;
            pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        })
        .catch(() => {
          if (pollCount.current >= MAX_POLLS - 1) navigate(`/us/${slug}/community`, { replace: true });
          else { pollCount.current += 1; pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS); }
        });
    }
    pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
  }, [navigate, slug]);

  return (
    <Center h="70vh">
      <Stack align="center" gap="md">
        {confirmed ? (
          <>
            <Title order={3}>Your Community is live!</Title>
            <Text c="dimmed">Redirecting you to your dashboard…</Text>
          </>
        ) : (
          <>
            <Loader size="lg" />
            <Text c="dimmed">Confirming your payment…</Text>
          </>
        )}
      </Stack>
    </Center>
  );
}
