import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { communityFetch } from "../hooks/useCommunity";
import type { CommunitySubscriptionStatusOut } from "../types";

/** FR-1.1: shown on the Referrer's own dashboard when they have no active Community subscription. */
export function CommunityUpsellBanner() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CommunitySubscriptionStatusOut | null>(null);

  useEffect(() => {
    communityFetch("/api/communities/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CommunitySubscriptionStatusOut | null) => setStatus(d))
      .catch(() => setStatus(null));
  }, []);

  if (!status || status.has_active_subscription) return null;

  return (
    <Card withBorder radius="md" p="md" mb="md" style={{ background: "var(--gk-brand-gradient)" }}>
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Text fw={700} c="white">Start a Community — $9.99/mo</Text>
          <Text size="xs" c="white" style={{ opacity: 0.85 }}>
            A branded group directory with its own Member roster and curated Pro List.
          </Text>
        </Stack>
        <Button
          size="xs"
          radius="xl"
          style={{ background: "#fff", color: "var(--gk-accent-primary)" }}
          onClick={() => navigate(`/us/${slug}/community/checkout`)}
        >
          Start a Community
        </Button>
      </Group>
    </Card>
  );
}
