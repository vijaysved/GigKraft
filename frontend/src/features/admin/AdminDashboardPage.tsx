import {
  Alert,
  Badge,
  Box,
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
  getAdminMetrics,
  getAdminTriage,
  getHealth,
  type HealthOut,
  type MetricsOut,
  type TriageOut,
} from "../../api/endpoints";
import { GkStatTile } from "../../components/GkStatTile";
import { useAuth } from "../../auth/AuthContext";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthOut | null>(null);
  const [metrics, setMetrics] = useState<MetricsOut | null>(null);
  const [triage, setTriage] = useState<TriageOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [h, m, t] = await Promise.all([getHealth(), getAdminMetrics(), getAdminTriage()]);
        if (!cancelled) { setHealth(h); setMetrics(m); setTriage(t); }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load dashboard.");
      }
    }
    void load();
    const timer = setInterval(() => { void load(); }, 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Regional Core Ops</Title>
        {health && (
          <Badge color={health.status === "ok" ? "green" : "red"} variant="dot">
            Backend {health.status}
          </Badge>
        )}
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <GkStatTile label="Pending triage" value={metrics?.pending_triage} hint="Unrouted emergencies" />
        <GkStatTile label="Active pros" value={metrics?.active_pros} />
        <GkStatTile label="Jobs won (30d)" value={metrics?.jobs_won_30d} hint={metrics ? `${metrics.win_rate_pct}% win rate` : undefined} />
        <GkStatTile label="Node" value={user?.node_id ?? "—"} accent hint="Node manager" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Group justify="space-between">
              <Title order={4}>Emergency queue</Title>
              {triage ? (
                <Badge color={triage.unrouted ? "red" : "green"}>{triage.unrouted} unrouted</Badge>
              ) : (
                <Loader size="sm" />
              )}
            </Group>
            {triage?.rows.slice(0, 5).map((row) => (
              <Card key={row.id} withBorder radius="sm" padding="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs">
                      <Badge variant="light" size="xs">{row.kind}</Badge>
                      <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {row.age_minutes}m ago
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} truncate>{row.description}</Text>
                    <Text size="xs" c="dimmed">${row.budget_ceiling} · {row.address}</Text>
                  </Stack>
                </Group>
              </Card>
            ))}
            {triage?.rows.length === 0 && (
              <Text size="sm" c="dimmed">Queue is clear.</Text>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={4}>Backend integrations</Title>
            {health ? (
              <SimpleGrid cols={2}>
                {Object.entries(health.mocks).map(([name, mocked]) => (
                  <Box key={name}>
                    <Badge variant="light" color={mocked ? "orange" : "green"} size="sm">
                      {name}: {mocked ? "mock" : "live"}
                    </Badge>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Loader size="sm" />
            )}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
