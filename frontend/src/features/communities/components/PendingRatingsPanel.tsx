import { Alert, Badge, Button, Card, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { IconCheck, IconStar, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { approveRecommendation, decodeRecText, hideRecommendation, REC_METRICS } from "../../../api/recommendations";
import { communityFetch } from "../hooks/useCommunity";

interface PendingRatingOut {
  id: number;
  referrer_pro_id: number;
  pro_name: string;
  rater_name: string;
  stars: number | null;
  text: string;
  created_at: string;
}

/** Ratings submitted from a pro's card for one of this Community's
 * off-platform pros, awaiting approval before they count toward that pro's
 * public score — design-specs/12.OffPlatformProRatings.md §4/§9 #3. */
export function PendingRatingsPanel() {
  const [ratings, setRatings] = useState<PendingRatingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communityFetch("/api/me/community/pending-ratings");
      if (res.ok) setRatings(await res.json() as PendingRatingOut[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  async function handleApprove(id: number) {
    setActingId(id);
    setError(null);
    try {
      await approveRecommendation(id);
      setRatings((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve.");
    } finally {
      setActingId(null);
    }
  }

  async function handleHide(id: number) {
    setActingId(id);
    setError(null);
    try {
      await hideRecommendation(id);
      setRatings((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not decline.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (ratings.length === 0) {
    return <Text size="sm" c="dimmed">No ratings pending approval.</Text>;
  }

  return (
    <Stack gap="sm">
      {error && <Alert color="red" variant="light">{error}</Alert>}
      {ratings.map((r) => {
        const { metrics, text } = decodeRecText(r.text);
        return (
          <Card key={r.id} withBorder radius="md" padding="md">
            <Stack gap={6}>
              <Group justify="space-between">
                <Text fw={700} size="sm">{r.pro_name}</Text>
                {r.stars != null && (
                  <Group gap={2}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <IconStar
                        key={n} size={13}
                        fill={n <= r.stars! ? "var(--gk-accent-primary)" : "none"}
                        color={n <= r.stars! ? "var(--gk-accent-primary)" : "var(--gk-border)"}
                      />
                    ))}
                  </Group>
                )}
              </Group>
              <Text size="xs" c="dimmed">Rated by {r.rater_name}</Text>
              {metrics && (
                <Group gap={4} wrap="wrap">
                  {REC_METRICS.map(({ key, label }) => (
                    <Badge key={key} size="xs" variant="light" color={metrics[key] ? "green" : "red"}>
                      {label}: {metrics[key] ? "Yes" : "No"}
                    </Badge>
                  ))}
                </Group>
              )}
              {text.trim() && <Text size="sm" fs="italic">"{text.trim()}"</Text>}
              <Group gap="sm" justify="flex-end">
                <Button
                  size="xs" variant="light" color="red" leftSection={<IconX size={13} />}
                  loading={actingId === r.id} onClick={() => void handleHide(r.id)}
                >
                  Decline
                </Button>
                <Button
                  size="xs" color="green" leftSection={<IconCheck size={13} />}
                  loading={actingId === r.id} onClick={() => void handleApprove(r.id)}
                >
                  Approve
                </Button>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
