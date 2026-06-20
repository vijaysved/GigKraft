import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Pagination,
  SegmentedControl,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCircleDot,
  IconLock,
  IconPlugConnected,
  IconRefresh,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

// ── types ──────────────────────────────────────────────────────────────────

interface StripeConfig {
  mode: "test" | "live";
  effective_mode: "test" | "live";
  mode_locked: boolean;
  test_price_monthly: string;
  test_price_annual: string;
  live_price_monthly: string;
  live_price_annual: string;
  test_key_set: boolean;
  live_key_set: boolean;
  webhook_secret_set: boolean;
  updated_at: string | null;
}

interface ConnectionResult {
  ok: boolean;
  mode: string;
  account_id: string | null;
  account_name: string | null;
  error: string | null;
}

interface SubscriberRow {
  id: number;
  pro_name: string;
  email: string;
  plan: string;
  plan_label: string;
  status: string;
  renews_at: string | null;
  monthly_value: number;
  date_joined: string;
}

interface SubscribersData {
  total_active: number;
  total_mrr: number;
  items: SubscriberRow[];
}

interface TransactionRow {
  id: number;
  issued_at: string;
  pro_name: string;
  pro_email: string;
  plan: string;
  plan_label: string;
  amount: number;
  status: string;
  period_label: string;
}

interface TransactionsData {
  total_count: number;
  total_amount: number;
  items: TransactionRow[];
}

// ── API helpers ────────────────────────────────────────────────────────────

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
      ...(init?.headers ?? {}),
    },
  });
}

async function fetchConfig(): Promise<StripeConfig> {
  const res = await authFetch("/api/gk-admin/stripe-config");
  if (!res.ok) throw new Error("Failed to load Stripe config");
  return res.json() as Promise<StripeConfig>;
}

async function saveConfig(cfg: Omit<StripeConfig, "test_key_set" | "live_key_set" | "webhook_secret_set" | "updated_at">): Promise<StripeConfig> {
  const res = await authFetch("/api/gk-admin/stripe-config", {
    method: "PUT",
    body: JSON.stringify(cfg),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? "Failed to save");
  }
  return res.json() as Promise<StripeConfig>;
}

async function testConnection(): Promise<ConnectionResult> {
  const res = await authFetch("/api/gk-admin/stripe-config/test-connection", { method: "POST" });
  if (!res.ok) throw new Error("Request failed");
  return res.json() as Promise<ConnectionResult>;
}

// ── helpers ────────────────────────────────────────────────────────────────

function KeyStatusBadge({ set, label }: { set: boolean; label: string }) {
  return (
    <Tooltip label={set ? "Present in server environment" : "Not found in server environment"}>
      <Badge size="sm" variant="dot" color={set ? "green" : "red"}>
        {label}: {set ? "set" : "missing"}
      </Badge>
    </Tooltip>
  );
}

const STATUS_COLOR: Record<string, string> = {
  active: "green",
  past_due: "orange",
  cancelled: "red",
  paid: "green",
  open: "orange",
  void: "gray",
};

// ── Setup tab ──────────────────────────────────────────────────────────────

function SetupTab() {
  const [cfg, setCfg] = useState<StripeConfig | null>(null);
  const [form, setForm] = useState<Omit<StripeConfig, "test_key_set" | "live_key_set" | "webhook_secret_set" | "updated_at"> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoadError(null);
    try {
      const data = await fetchConfig();
      setCfg(data);
      setForm({
        mode: data.mode,
        effective_mode: data.effective_mode,
        mode_locked: data.mode_locked,
        test_price_monthly: data.test_price_monthly,
        test_price_annual: data.test_price_annual,
        live_price_monthly: data.live_price_monthly,
        live_price_annual: data.live_price_annual,
      });
    } catch {
      setLoadError("Could not load Stripe configuration from the server.");
    }
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSavedAt(null);
    try {
      const updated = await saveConfig(form);
      setCfg(updated);
      setForm({
        mode: updated.mode,
        effective_mode: updated.effective_mode,
        mode_locked: updated.mode_locked,
        test_price_monthly: updated.test_price_monthly,
        test_price_annual: updated.test_price_annual,
        live_price_monthly: updated.live_price_monthly,
        live_price_annual: updated.live_price_annual,
      });
      setSavedAt(new Date().toLocaleTimeString());
      setConnectionResult(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setConnectionResult(null);
    try {
      setConnectionResult(await testConnection());
    } catch {
      setConnectionResult({ ok: false, mode: form?.mode ?? "test", account_id: null, account_name: null, error: "Request to server failed." });
    } finally {
      setTesting(false);
    }
  }

  const activeMode = form?.mode ?? "test";

  if (loadError) return <Alert color="red" icon={<IconAlertCircle size={16} />}>{loadError}</Alert>;
  if (!form || !cfg) return <Loader size="sm" />;

  return (
    <Stack maw={680}>
      <Text size="sm" c="dimmed">
        Manage Stripe price IDs and toggle between test and live mode. Secret keys are
        read from server environment variables and are never exposed here.
      </Text>

      <Card withBorder radius="md" padding="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={6}>Server Environment Variables</Title>
            <Button size="xs" variant="subtle" leftSection={<IconRefresh size={14} />} onClick={() => void load()}>
              Refresh
            </Button>
          </Group>
          <Group gap="xs" wrap="wrap">
            <KeyStatusBadge set={cfg.test_key_set} label="STRIPE_TEST_SECRET_KEY" />
            <KeyStatusBadge set={cfg.live_key_set} label="STRIPE_SECRET_KEY" />
            <KeyStatusBadge set={cfg.webhook_secret_set} label="STRIPE_WEBHOOK_SECRET" />
          </Group>
          {cfg.updated_at && (
            <Text size="xs" c="dimmed">Last saved: {new Date(cfg.updated_at).toLocaleString()}</Text>
          )}
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={6}>Active Mode</Title>
            {cfg.mode_locked && (
              <Tooltip label="Mode is forced by the STRIPE_MODE environment variable on the server.">
                <Badge size="sm" color="gray" variant="light" leftSection={<IconLock size={10} />}>
                  locked by env var
                </Badge>
              </Tooltip>
            )}
          </Group>
          <SegmentedControl
            value={form.mode}
            disabled={cfg.mode_locked}
            onChange={(v) => { setForm((f) => f ? { ...f, mode: v as "test" | "live" } : f); setConnectionResult(null); }}
            data={[
              { value: "test", label: "🧪 Test (sandbox)" },
              { value: "live", label: "🚀 Live (production)" },
            ]}
            color={activeMode === "live" ? "red" : "violet"}
          />
          {cfg.mode_locked && (
            <Text size="xs" c="dimmed">Set <code>STRIPE_MODE=test</code> or <code>STRIPE_MODE=live</code> in server env to control this.</Text>
          )}
          {activeMode === "live" && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />} p="xs">
              <Text size="xs">Live mode charges real cards. Verify all price IDs and keys before enabling.</Text>
            </Alert>
          )}
        </Stack>
      </Card>

      <Card withBorder radius="md" padding="md">
        <Stack gap="md">
          <Title order={6}>Price IDs</Title>
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Test Mode (sandbox)</Text>
            <Group grow>
              <TextInput
                label="Monthly price ID"
                placeholder="price_test_..."
                value={form.test_price_monthly}
                onChange={(e) => { const v = e.currentTarget.value; setForm((f) => f ? { ...f, test_price_monthly: v } : f); }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <TextInput
                label="Annual price ID"
                placeholder="price_test_..."
                value={form.test_price_annual}
                onChange={(e) => { const v = e.currentTarget.value; setForm((f) => f ? { ...f, test_price_annual: v } : f); }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
            </Group>
          </Stack>
          <Divider />
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">Live Mode (production)</Text>
            <Group grow>
              <TextInput
                label="Monthly price ID"
                placeholder="price_live_..."
                value={form.live_price_monthly}
                onChange={(e) => { const v = e.currentTarget.value; setForm((f) => f ? { ...f, live_price_monthly: v } : f); }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
              <TextInput
                label="Annual price ID"
                placeholder="price_live_..."
                value={form.live_price_annual}
                onChange={(e) => { const v = e.currentTarget.value; setForm((f) => f ? { ...f, live_price_annual: v } : f); }}
                styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
              />
            </Group>
          </Stack>
        </Stack>
      </Card>

      <Group>
        <Button onClick={() => void handleSave()} loading={saving} leftSection={<IconCheck size={16} />}>
          Save configuration
        </Button>
        <Button variant="light" onClick={() => void handleTestConnection()} loading={testing} leftSection={<IconPlugConnected size={16} />}>
          Test connection ({activeMode})
        </Button>
      </Group>

      {saveError && <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />}>{saveError}</Alert>}
      {savedAt && <Alert color="green" variant="light" icon={<IconCheck size={14} />}>Saved at {savedAt}</Alert>}

      {connectionResult && (
        <Card withBorder radius="md" padding="md" style={{ borderColor: connectionResult.ok ? "var(--mantine-color-green-5)" : "var(--mantine-color-red-5)" }}>
          <Stack gap="xs">
            <Group gap="xs">
              <IconCircleDot size={16} color={connectionResult.ok ? "var(--mantine-color-green-6)" : "var(--mantine-color-red-6)"} />
              <Text size="sm" fw={600} c={connectionResult.ok ? "green" : "red"}>
                {connectionResult.ok ? "Connected successfully" : "Connection failed"}
              </Text>
              <Badge size="xs" color={connectionResult.mode === "live" ? "red" : "violet"} variant="light">{connectionResult.mode}</Badge>
            </Group>
            {connectionResult.ok && (
              <>
                <Text size="xs" c="dimmed">Account ID: <Text span style={{ fontFamily: "monospace" }}>{connectionResult.account_id}</Text></Text>
                {connectionResult.account_name && <Text size="xs" c="dimmed">Account name: {connectionResult.account_name}</Text>}
              </>
            )}
            {connectionResult.error && <Text size="xs" c="red">{connectionResult.error}</Text>}
          </Stack>
        </Card>
      )}

      <Card withBorder radius="md" padding="md" bg="var(--mantine-color-dark-8)">
        <Stack gap="xs">
          <Title order={6} c="dimmed">Required .env variables</Title>
          <Text size="xs" style={{ fontFamily: "monospace", whiteSpace: "pre", color: "var(--mantine-color-green-4)" }}>
{`STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=https://your-app.vercel.app`}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}

// ── Subscribers tab ────────────────────────────────────────────────────────

function SubscribersTab() {
  const [data, setData] = useState<SubscribersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    authFetch("/api/gk-admin/billing/subscribers")
      .then((r) => r.json())
      .then((d) => setData(d as SubscribersData))
      .catch(() => setError("Failed to load subscribers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader size="sm" mt="md" />;
  if (error) return <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>;
  if (!data) return null;

  return (
    <Stack mt="md" maw={860}>
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          <Text span fw={700} c="var(--gk-accent-primary)">{data.total_active}</Text> active subscriber{data.total_active !== 1 ? "s" : ""}
        </Text>
        <Text size="sm" c="dimmed">·</Text>
        <Text size="sm" c="dimmed">
          <Text span fw={700} c="green">${data.total_mrr.toFixed(2)}</Text> MRR
        </Text>
      </Group>

      {data.items.length === 0 ? (
        <Text size="sm" c="dimmed">No subscriptions yet.</Text>
      ) : (
        <Table withRowBorders striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Pro</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Plan</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Renewal</Table.Th>
              <Table.Th>MRR</Table.Th>
              <Table.Th>Joined</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.items.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td fw={600}>{row.pro_name}</Table.Td>
                <Table.Td c="dimmed">{row.email}</Table.Td>
                <Table.Td>{row.plan_label}</Table.Td>
                <Table.Td>
                  <Badge size="xs" color={STATUS_COLOR[row.status] ?? "gray"} variant="light">
                    {row.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{row.renews_at ?? "—"}</Table.Td>
                <Table.Td>${row.monthly_value.toFixed(2)}</Table.Td>
                <Table.Td c="dimmed">{row.date_joined}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

// ── Transactions tab ───────────────────────────────────────────────────────

function TransactionsTab() {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    setLoading(true);
    authFetch(`/api/gk-admin/billing/transactions?page=${page}&page_size=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((d) => setData(d as TransactionsData))
      .catch(() => setError("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loader size="sm" mt="md" />;
  if (error) return <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total_count / PAGE_SIZE);

  return (
    <Stack mt="md" maw={860}>
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          <Text span fw={700} c="var(--gk-accent-primary)">{data.total_count}</Text> transaction{data.total_count !== 1 ? "s" : ""}
        </Text>
        <Text size="sm" c="dimmed">·</Text>
        <Text size="sm" c="dimmed">
          <Text span fw={700} c="green">${data.total_amount.toFixed(2)}</Text> total collected
        </Text>
      </Group>

      {data.items.length === 0 ? (
        <Text size="sm" c="dimmed">No transactions yet.</Text>
      ) : (
        <>
          <Table withRowBorders striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Pro</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Period</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.items.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td c="dimmed">{row.issued_at}</Table.Td>
                  <Table.Td fw={600}>{row.pro_name}</Table.Td>
                  <Table.Td c="dimmed">{row.pro_email}</Table.Td>
                  <Table.Td>{row.plan_label}</Table.Td>
                  <Table.Td>{row.period_label}</Table.Td>
                  <Table.Td fw={600}>${row.amount.toFixed(2)}</Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={STATUS_COLOR[row.status] ?? "gray"} variant="light">
                      {row.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {totalPages > 1 && (
            <Pagination value={page} onChange={setPage} total={totalPages} size="sm" />
          )}
        </>
      )}
    </Stack>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function GkAdminStripePage() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Stripe</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      <Tabs defaultValue="setup" color="violet">
        <Tabs.List>
          <Tabs.Tab value="setup" leftSection={<IconPlugConnected size={15} />}>Setup</Tabs.Tab>
          <Tabs.Tab value="subscribers" leftSection={<IconUsers size={15} />}>Subscribers</Tabs.Tab>
          <Tabs.Tab value="transactions" leftSection={<IconReceipt size={15} />}>Transactions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="setup" pt="md">
          <SetupTab />
        </Tabs.Panel>

        <Tabs.Panel value="subscribers">
          <SubscribersTab />
        </Tabs.Panel>

        <Tabs.Panel value="transactions">
          <TransactionsTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
