import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
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
  blastEmergency,
  getAdminMetrics,
  getAdminTriage,
  getHealth,
  listPendingKrafts,
  pinEmergency,
  rejectKraft,
  verifyKraft,
  type HealthOut,
  type KraftOut,
  type MetricsOut,
  type TriageOut,
} from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthOut | null>(null);
  const [metrics, setMetrics] = useState<MetricsOut | null>(null);
  const [triage, setTriage] = useState<TriageOut | null>(null);
  const [krafts, setKrafts] = useState<KraftOut[]>([]);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [workError, setWorkError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});

  async function loadM5() {
    setWorkError(null);
    const [nextMetrics, nextTriage, nextKrafts] = await Promise.all([
      getAdminMetrics(),
      getAdminTriage(),
      listPendingKrafts(),
    ]);
    setMetrics(nextMetrics);
    setTriage(nextTriage);
    setKrafts(nextKrafts);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getHealth(), loadM5()])
      .then(([data]) => {
        if (!cancelled) {
          setHealth(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          if (error instanceof ApiError && error.status !== 0) {
            setWorkError(error.message);
          } else {
            setHealthError("Backend is unreachable. Is it running on port 8000?");
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setWorkError(null);
    try {
      await action();
      await loadM5();
    } catch (error) {
      setWorkError(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Stack>
      <Title order={3}>Node manager dashboard</Title>
      {workError && (
        <Alert color="red" variant="light">
          {workError}
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack gap="xs">
            <Title order={5}>Your profile</Title>
            {user ? (
              <>
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {[user.first_name, user.last_name]
                      .filter(Boolean)
                      .join(" ") || "Unnamed user"}
                  </Text>
                  <Badge size="sm" variant="light">
                    {user.role}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Email: {user.email ?? "-"}
                </Text>
                <Text size="sm" c="dimmed">
                  Node: {user.node_id ?? "not assigned"}
                </Text>
              </>
            ) : (
              <Loader size="sm" />
            )}
          </Stack>
        </Card>
        <Card withBorder radius="md" padding="lg">
          <Stack gap="xs">
            <Title order={5}>Backend status</Title>
            {healthError && (
              <Alert color="red" variant="light">
                {healthError}
              </Alert>
            )}
            {!health && !healthError && <Loader size="sm" />}
            {health && (
              <>
                <Group gap="xs">
                  <Badge color={health.status === "ok" ? "green" : "red"}>
                    {health.status}
                  </Badge>
                  {health.debug && <Badge color="yellow">debug</Badge>}
                </Group>
                <Text size="sm" c="dimmed">
                  Mocked integrations:
                </Text>
                <Group gap="xs">
                  {Object.entries(health.mocks).map(([name, mocked]) => (
                    <Badge
                      key={name}
                      variant="light"
                      color={mocked ? "orange" : "green"}
                    >
                      {name}: {mocked ? "mock" : "live"}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Stack>
        </Card>
        <MetricCard
          label="Pending triage"
          value={metrics?.pending_triage}
          hint={metrics ? `${metrics.active_pros} active pros` : undefined}
        />
        <MetricCard
          label="Jobs won"
          value={metrics?.jobs_won_30d}
          hint={metrics ? `${metrics.win_rate_pct}% win rate, 30d` : undefined}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Group justify="space-between">
              <Title order={4}>Emergency triage</Title>
              {triage ? (
                <Badge color={triage.unrouted ? "red" : "green"}>
                  {triage.unrouted} unrouted
                </Badge>
              ) : (
                <Loader size="sm" />
              )}
            </Group>
            {triage?.rows.length === 0 && (
              <Text size="sm" c="dimmed">
                No open emergencies need routing.
              </Text>
            )}
            {triage?.rows.map((row) => (
              <Card key={row.id} withBorder radius="sm" padding="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge variant="light">{row.kind}</Badge>
                    <Text size="xs" c="dimmed">
                      {row.age_minutes}m old
                    </Text>
                  </Group>
                  <Text fw={600}>{row.description}</Text>
                  <Text size="sm" c="dimmed">
                    {row.address} · ${row.budget_ceiling}
                  </Text>
                  <Group>
                    <Button
                      size="xs"
                      loading={busy === `blast-${row.id}`}
                      onClick={() =>
                        runAction(`blast-${row.id}`, () => blastEmergency(row.id))
                      }
                    >
                      Mock blast
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      loading={busy === `pin-${row.id}`}
                      onClick={() =>
                        runAction(`pin-${row.id}`, () => pinEmergency(row.id))
                      }
                    >
                      Mark routed
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Group justify="space-between">
              <Title order={4}>Kraft verification</Title>
              <Badge color={krafts.length ? "yellow" : "green"}>
                {krafts.length} pending
              </Badge>
            </Group>
            {krafts.length === 0 && (
              <Text size="sm" c="dimmed">
                No Krafts are waiting for review.
              </Text>
            )}
            {krafts.map((kraft) => (
              <Card key={kraft.id} withBorder radius="sm" padding="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={600}>{kraft.title}</Text>
                    <Badge color={kraft.has_after ? "green" : "red"}>
                      {kraft.has_after ? "has after" : "missing after"}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {kraft.pro.name} · invoice{" "}
                    {(kraft as any).invoice_confirmed
                      ? `$${(kraft as any).invoice_cost ?? "-"} confirmed`
                      : "not confirmed"}
                  </Text>
                  <Text size="sm">{kraft.description}</Text>
                  <Divider />
                  <TextInput
                    size="xs"
                    placeholder="Rejection note"
                    value={rejectNotes[kraft.id] ?? ""}
                    onChange={(event) =>
                      setRejectNotes((prev) => ({
                        ...prev,
                        [kraft.id]: event.currentTarget.value,
                      }))
                    }
                  />
                  <Group>
                    <Button
                      size="xs"
                      loading={busy === `verify-${kraft.id}`}
                      disabled={!kraft.has_after || !(kraft as any).invoice_confirmed}
                      onClick={() =>
                        runAction(`verify-${kraft.id}`, () =>
                          verifyKraft(kraft.id),
                        )
                      }
                    >
                      Verify
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      loading={busy === `reject-${kraft.id}`}
                      onClick={() =>
                        runAction(`reject-${kraft.id}`, () =>
                          rejectKraft(kraft.id, rejectNotes[kraft.id] ?? ""),
                        )
                      }
                    >
                      Reject
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value?: number;
  hint?: string;
}) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        {value === undefined ? <Loader size="sm" /> : <Title order={3}>{value}</Title>}
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
