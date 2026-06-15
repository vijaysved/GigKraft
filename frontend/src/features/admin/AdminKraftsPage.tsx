import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  ApiError,
  listPendingKrafts,
  rejectKraft,
  verifyKraft,
  type KraftOut,
} from "../../api/endpoints";
import { GkBeforeAfter } from "../../components/GkBeforeAfter";
import { GkEmptyState } from "../../components/GkEmptyState";
import { GkProofBadge } from "../../components/GkProofBadge";

export function AdminKraftsPage() {
  const [krafts, setKrafts] = useState<KraftOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});

  async function load() {
    try {
      const data = await listPendingKrafts();
      setKrafts(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load krafts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 30000);
    return () => clearInterval(timer);
  }, []);

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <Loader />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Kraft Verification</Title>
        <Badge color={krafts.length ? "yellow" : "green"}>{krafts.length} pending</Badge>
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      {krafts.length === 0 ? (
        <GkEmptyState title="No Krafts pending" description="All caught up — nothing awaiting review." />
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {krafts.map((kraft) => (
            <Card key={kraft.id} withBorder radius="md" padding="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={700}>{kraft.title}</Text>
                  <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    #{kraft.id}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">{kraft.pro.name}</Text>
                <GkBeforeAfter height={100} />
                <Group gap="xs">
                  <GkProofBadge confirmed={kraft.has_after} label="After photo" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <GkProofBadge confirmed={(kraft as any).invoice_confirmed} amount={(kraft as any).invoice_cost ?? undefined} />
                </Group>
                <Text size="sm">{kraft.description}</Text>
                <TextInput
                  size="xs"
                  placeholder="Rejection note"
                  value={rejectNotes[kraft.id] ?? ""}
                  onChange={(e) => setRejectNotes((p) => ({ ...p, [kraft.id]: e.currentTarget.value }))}
                />
                <Group>
                  <Button
                    size="xs"
                    loading={busy === `verify-${kraft.id}`}
                    disabled={!kraft.has_after || !(kraft as any).invoice_confirmed}
                    onClick={() => runAction(`verify-${kraft.id}`, () => verifyKraft(kraft.id))}
                  >
                    Verify
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    loading={busy === `reject-${kraft.id}`}
                    onClick={() => runAction(`reject-${kraft.id}`, () => rejectKraft(kraft.id, rejectNotes[kraft.id] ?? ""))}
                  >
                    Reject
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
