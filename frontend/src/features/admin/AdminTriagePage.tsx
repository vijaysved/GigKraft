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
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  ApiError,
  blastEmergency,
  getAdminTriage,
  pinEmergency,
  type TriageOut,
} from "../../api/endpoints";
import { GkEmptyState } from "../../components/GkEmptyState";
import { GkStatTile } from "../../components/GkStatTile";

export function AdminTriagePage() {
  const [triage, setTriage] = useState<TriageOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getAdminTriage();
      setTriage(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load triage.");
    }
  }

  useEffect(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 15000);
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

  return (
    <Stack>
      <Title order={3}>Cross-Channel Triage Desk</Title>
      {error && <Alert color="red" variant="light">{error}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <GkStatTile label="Unrouted" value={triage?.unrouted} />
        <GkStatTile label="Total in queue" value={triage?.rows.length} />
        <GkStatTile label="Status" value={triage?.unrouted === 0 ? "Clear" : "Needs action"} accent={!!triage?.unrouted} />
      </SimpleGrid>

      {!triage && <Loader />}

      {triage?.rows.length === 0 && (
        <GkEmptyState title="Queue is clear" description="No emergencies awaiting routing." />
      )}

      <Stack gap="sm">
        {triage?.rows.map((row) => (
          <Card key={row.id} withBorder radius="md" padding="md">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs">
                  <Badge variant="light">{row.kind}</Badge>
                  <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    #{row.id} · {row.age_minutes}m ago
                  </Text>
                </Group>
                <Text fw={600}>{row.description}</Text>
                <Text size="sm" c="dimmed">{row.address}</Text>
                <Text size="sm" fw={500} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                  Budget: ${row.budget_ceiling}
                </Text>
              </Stack>
              <Stack gap="xs">
                <Button
                  size="xs"
                  loading={busy === `blast-${row.id}`}
                  onClick={() => runAction(`blast-${row.id}`, () => blastEmergency(row.id))}
                >
                  WhatsApp Blast
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  loading={busy === `pin-${row.id}`}
                  onClick={() => runAction(`pin-${row.id}`, () => pinEmergency(row.id))}
                >
                  Mark Routed
                </Button>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
