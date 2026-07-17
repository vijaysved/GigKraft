import { Alert, Button, Card, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { communityFetch } from "../hooks/useCommunity";
import type { PendingProRecommendationOut } from "../types";

interface Props {
  /** Fired whenever the pending count changes — lets the parent tab show a badge. */
  onCountChange?: (count: number) => void;
}

/** Pro suggestions submitted by joined Members via "Recommend a Pro" on the
 * public page, awaiting Owner/Moderator approval before they appear on the
 * Community's pro list — design-specs/13.RecommendAPro-LandingIntent.md §4. */
export function PendingProRecommendationsPanel({ onCountChange }: Props) {
  const [rows, setRows] = useState<PendingProRecommendationOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communityFetch("/api/me/community/pending-pro-recommendations");
      if (res.ok) setRows(await res.json() as PendingProRecommendationOut[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);
  useEffect(() => { onCountChange?.(rows.length); }, [rows.length, onCountChange]);

  async function handleApprove(id: number) {
    setActingId(id);
    setError(null);
    try {
      const res = await communityFetch(`/api/me/community/pending-pro-recommendations/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Could not approve.");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve.");
    } finally {
      setActingId(null);
    }
  }

  async function handleDecline(id: number) {
    setActingId(id);
    setError(null);
    try {
      const res = await communityFetch(`/api/me/community/pending-pro-recommendations/${id}/decline`, { method: "POST" });
      if (!res.ok) throw new Error("Could not decline.");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not decline.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (rows.length === 0) {
    return <Text size="sm" c="dimmed">No pro suggestions pending approval.</Text>;
  }

  return (
    <Stack gap="sm">
      {error && <Alert color="red" variant="light">{error}</Alert>}
      {rows.map((r) => (
        <Card key={r.id} withBorder radius="md" padding="md">
          <Stack gap={6}>
            <Group justify="space-between">
              <Text fw={700} size="sm">{r.name}{r.trade ? ` · ${r.trade}` : ""}</Text>
            </Group>
            <Text size="xs" c="dimmed">
              Suggested by {r.submitted_by_name || "a Member"} · {r.phone || r.email}
            </Text>
            {r.url && (
              <Text size="xs">
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a>
              </Text>
            )}
            {r.endorsement && <Text size="sm" fs="italic">"{r.endorsement}"</Text>}
            <Group gap="sm" justify="flex-end">
              <Button
                size="xs" variant="light" color="red" leftSection={<IconX size={13} />}
                loading={actingId === r.id} onClick={() => void handleDecline(r.id)}
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
      ))}
    </Stack>
  );
}
