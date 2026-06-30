import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Code,
  CopyButton,
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
  IconCopy,
  IconCreditCard,
  IconLock,
  IconPlugConnected,
  IconRefresh,
  IconReceipt,
  IconShoppingCart,
  IconTerminal,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

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

// ── CLI Listener card (test mode only) ────────────────────────────────────

interface CliStatus {
  running: boolean;
  secret: string | null;
}

interface CliStartResult extends CliStatus {
  error: string | null;
}

async function fetchCliStatus(): Promise<CliStatus> {
  const res = await authFetch("/api/gk-admin/stripe-cli/status");
  if (!res.ok) throw new Error("failed");
  return res.json() as Promise<CliStatus>;
}

async function startCliListener(forwardTo: string): Promise<CliStartResult> {
  const res = await authFetch("/api/gk-admin/stripe-cli/start", {
    method: "POST",
    body: JSON.stringify({ forward_to: forwardTo }),
  });
  if (!res.ok) throw new Error("failed");
  return res.json() as Promise<CliStartResult>;
}

function CliListenerCard() {
  const [status, setStatus] = useState<CliStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [forwardTo, setForwardTo] = useState("http://localhost:8000/api/stripe/webhook");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh() {
    try {
      setStatus(await fetchCliStatus());
    } catch {
      /* network error — keep previous state */
    }
  }

  useEffect(() => {
    void refresh();
    function schedule() {
      pollRef.current = setTimeout(async () => {
        await refresh();
        schedule();
      }, 5000);
    }
    schedule();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  async function handleStart() {
    setStarting(true);
    setStartError(null);
    try {
      const result = await startCliListener(forwardTo);
      setStatus({ running: result.running, secret: result.secret });
      if (result.error) setStartError(result.error);
    } catch {
      setStartError("Request to server failed.");
    } finally {
      setStarting(false);
    }
  }

  const running = status?.running ?? false;
  const secret = status?.secret ?? null;

  return (
    <Card withBorder radius="md" padding="md" style={{ borderColor: running ? "var(--mantine-color-green-6)" : "var(--mantine-color-orange-6)" }}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconTerminal size={16} />
            <Title order={6}>Dev: CLI Listener</Title>
            <Badge size="xs" color="orange" variant="light">test mode</Badge>
          </Group>
          <Button size="xs" variant="subtle" leftSection={<IconRefresh size={13} />} onClick={() => void refresh()}>
            Refresh
          </Button>
        </Group>

        <Group gap="xs">
          <IconCircleDot size={14} color={running ? "var(--mantine-color-green-6)" : "var(--mantine-color-orange-6)"} />
          <Text size="sm" fw={600} c={running ? "green" : "orange"}>
            {status === null ? "Checking…" : running ? "Listener running" : "Listener not running"}
          </Text>
        </Group>

        {!running && (
          <Stack gap="xs">
            <TextInput
              size="xs"
              label="Forward to"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.currentTarget.value)}
              styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 12 } }}
            />
            <Button
              size="xs"
              loading={starting}
              leftSection={<IconTerminal size={13} />}
              onClick={() => void handleStart()}
              color="orange"
              variant="light"
            >
              {starting ? "Starting… (up to 12s)" : "Start Listener"}
            </Button>
            {startError && (
              <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />} p="xs">
                <Text size="xs">{startError}</Text>
              </Alert>
            )}
            <Text size="xs" c="dimmed">
              Requires <Code fz="xs">stripe login</Code> first. The webhook secret is captured automatically and applied to the running server.
            </Text>
          </Stack>
        )}

        {secret && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>Webhook secret (auto-applied to this session):</Text>
            <Group gap="xs" wrap="nowrap">
              <Code style={{ fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {secret}
              </Code>
              <CopyButton value={secret}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied!" : "Copy"}>
                    <Button size="xs" variant="subtle" p={4} onClick={copy}>
                      {copied ? <IconCheck size={13} color="green" /> : <IconCopy size={13} />}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text size="xs" c="dimmed">
              Paste this into <Code fz="xs">backend/.env</Code> as <Code fz="xs">STRIPE_WEBHOOK_SECRET</Code> to persist across server restarts.
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

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

      {cfg.effective_mode === "test" && <CliListenerCard />}

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
        <Text size="sm" c="dimmed">No subscriptions yet — complete a test checkout to see subscribers here.</Text>
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
        <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
          <Text size="sm" fw={500}>No transactions recorded yet.</Text>
          <Text size="xs" c="dimmed" mt={4}>
            Transactions appear here after a Stripe checkout completes and the webhook fires.
            In dev, run <code>stripe listen --forward-to localhost:8000/api/stripe/webhook</code> then
            complete a test checkout from the Test Flow tab.
          </Text>
        </Alert>
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

// ── Test Flow tab ──────────────────────────────────────────────────────────

const TEST_CARDS = [
  { number: "4242 4242 4242 4242", description: "Always succeeds" },
  { number: "4000 0000 0000 0002", description: "Always declined" },
  { number: "4000 0025 0000 3155", description: "Requires 3D Secure" },
  { number: "4000 0000 0000 9995", description: "Insufficient funds" },
];

const PRO_FEATURES = [
  "Unlimited verified Krafts",
  "Homeowner endorsements on every job",
  "Zipcode standing & performance insights",
  "Full data export — your work is yours",
  "Invoice verification & emergency dispatch (soon)",
];

interface BillingConfig {
  stripe_mode: "test" | "live";
  webhook_secret_set: boolean;
  resend_mock: boolean;
}

interface SubscriptionStatus {
  has_active_subscription: boolean;
  subscription: {
    plan: string;
    plan_label: string;
    status: string;
    renews_at: string | null;
    card_last4: string;
  } | null;
  stripe_mode: string;
}

function TestFlowTab() {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const price = plan === "annual" ? "$249.99" : "$24.99";
  const unit = plan === "annual" ? "/yr" : "/mo";
  const note = plan === "annual" ? "billed once a year · save 17%" : "billed monthly · recurring";
  const planLabel = plan === "annual" ? "Pro Vault Annual" : "Pro Vault Monthly";

  async function loadStatus() {
    setLoadError(null);
    try {
      const [cfgRes, subRes] = await Promise.all([
        authFetch("/api/billing/config"),
        authFetch("/api/billing/subscription"),
      ]);
      if (!cfgRes.ok || !subRes.ok) throw new Error("Failed to load status");
      setBillingConfig(await cfgRes.json() as BillingConfig);
      setSubStatus(await subRes.json() as SubscriptionStatus);
    } catch {
      setLoadError("Could not load billing status. Make sure you are logged in as a pro/member account.");
    }
  }

  useEffect(() => { void loadStatus(); }, []);

  async function startCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; detail?: string };
      if (!res.ok || !data.url) {
        alert(data.detail ?? "Checkout failed — confirm Stripe price IDs are set on the Setup tab.");
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Network error starting checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const isTestMode = billingConfig?.stripe_mode === "test";

  return (
    <Stack mt="md" maw={900}>
      {loadError && <Alert color="orange" icon={<IconAlertCircle size={16} />}>{loadError}</Alert>}

      <Group align="flex-start" gap="xl" wrap="wrap">
        {/* ── Left: order preview ── */}
        <Stack style={{ flex: "1 1 340px", minWidth: 280 }} gap="md">
          <Title order={5}>Checkout Preview</Title>

          {/* Mode banner */}
          {billingConfig && (
            <Group gap="xs" wrap="wrap">
              <Badge variant="filled" color={isTestMode ? "orange" : "red"} size="sm">
                Stripe: {billingConfig.stripe_mode.toUpperCase()}
              </Badge>
              <Badge variant="filled" color={billingConfig.webhook_secret_set ? "green" : "red"} size="sm">
                Webhook: {billingConfig.webhook_secret_set ? "set" : "missing"}
              </Badge>
              <Badge variant="filled" color={billingConfig.resend_mock ? "orange" : "green"} size="sm">
                Email: {billingConfig.resend_mock ? "mock" : "live"}
              </Badge>
            </Group>
          )}
          {!billingConfig && !loadError && <Loader size="xs" />}

          {/* Plan picker */}
          <SegmentedControl
            value={plan}
            onChange={(v) => setPlan(v as "monthly" | "annual")}
            data={[
              { value: "monthly", label: "Monthly ($24.99/mo)" },
              { value: "annual", label: "Annual ($249.99/yr)" },
            ]}
            color="violet"
          />

          <Card withBorder shadow="md" radius="lg" p="xl" bg="var(--gk-bg-surface, #1a1b1e)">
            <Stack gap="md">
              <Stack gap={4}>
                <Group justify="space-between" align="center">
                  <Title order={3} style={{ color: "var(--gk-accent-primary, #845ef7)" }}>GigKraft Pro</Title>
                  <Box
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "var(--gk-brand-gradient, linear-gradient(90deg,#845ef7,#5c7cfa))",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {plan}
                  </Box>
                </Group>
                <Text size="sm" c="dimmed">{planLabel}</Text>
              </Stack>

              <Divider />

              <Group justify="space-between" align="flex-end">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.06em" }}>Total today</Text>
                  <Text size="xs" c="dimmed">{note}</Text>
                </Stack>
                <Group gap={2} align="flex-end">
                  <Title style={{ fontSize: 32, lineHeight: 1, color: "var(--gk-accent-primary, #845ef7)" }}>{price}</Title>
                  <Text size="sm" c="dimmed" fw={600} pb={4}>{unit}</Text>
                </Group>
              </Group>

              <Divider />

              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>What's included</Text>
                {PRO_FEATURES.map((f) => (
                  <Group key={f} gap="xs" align="center">
                    <IconCheck size={14} color="var(--gk-accent-primary, #845ef7)" style={{ flexShrink: 0 }} />
                    <Text size="sm" fw={500}>{f}</Text>
                  </Group>
                ))}
              </Stack>

              <Button
                size="md"
                fullWidth
                radius="md"
                loading={checkoutLoading}
                onClick={() => void startCheckout()}
                leftSection={<IconShoppingCart size={16} />}
                style={{ background: "var(--gk-accent-primary, #845ef7)", color: "#fff" }}
              >
                Launch {plan === "annual" ? "Annual" : "Monthly"} Checkout →
              </Button>

              <Group justify="center" gap="lg" wrap="wrap">
                <Group gap={4}>
                  <IconLock size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" c="dimmed">Secure via Stripe</Text>
                </Group>
                <Text size="xs" c="dimmed">Cancel anytime</Text>
                <Text size="xs" c="dimmed">No per-lead fees</Text>
              </Group>
            </Stack>
          </Card>
        </Stack>

        {/* ── Right: test cards + subscription status ── */}
        <Stack style={{ flex: "1 1 280px", minWidth: 240 }} gap="md">
          {/* Test cards */}
          {isTestMode && (
            <Card withBorder radius="md" padding="md">
              <Stack gap="sm">
                <Title order={6}>Test Cards</Title>
                <Text size="xs" c="dimmed">Any future expiry · any 3-digit CVV</Text>
                <Stack gap="xs">
                  {TEST_CARDS.map((card) => (
                    <Group key={card.number} justify="space-between" align="center" wrap="nowrap">
                      <Stack gap={0}>
                        <Code style={{ fontSize: 12, letterSpacing: 1 }}>{card.number}</Code>
                        <Text size="xs" c="dimmed">{card.description}</Text>
                      </Stack>
                      <CopyButton value={card.number.replace(/\s/g, "")}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Copied!" : "Copy number"}>
                            <Button size="xs" variant="subtle" onClick={copy} p={4}>
                              {copied ? <IconCheck size={13} color="green" /> : <IconCopy size={13} />}
                            </Button>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          )}

          {/* Current subscription */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Title order={6}>Current Subscription</Title>
                <Button size="xs" variant="subtle" leftSection={<IconRefresh size={13} />} onClick={() => void loadStatus()}>
                  Refresh
                </Button>
              </Group>
              {!subStatus && !loadError && <Loader size="xs" />}
              {subStatus?.has_active_subscription && subStatus.subscription ? (
                <Table withRowBorders={false}>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td c="dimmed" w={80}>Plan</Table.Td>
                      <Table.Td fw={600}>{subStatus.subscription.plan_label}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td c="dimmed">Status</Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={subStatus.subscription.status === "active" ? "green" : "orange"}>
                          {subStatus.subscription.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td c="dimmed">Renews</Table.Td>
                      <Table.Td>{subStatus.subscription.renews_at ?? "—"}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td c="dimmed">Card</Table.Td>
                      <Table.Td>•••• {subStatus.subscription.card_last4 || "—"}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              ) : (
                <Text size="sm" c="dimmed">No active subscription on this account.</Text>
              )}
            </Stack>
          </Card>

          {/* Live mode warning */}
          {billingConfig && !isTestMode && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />}>
              <Text size="xs">Stripe is in <strong>LIVE</strong> mode — checkout will charge a real card.</Text>
            </Alert>
          )}

          <Text size="xs" c="dimmed">
            After checkout you'll be redirected to <Code>/pro/billing/success</Code> where the subscription activates.
          </Text>
        </Stack>
      </Group>
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

      <Tabs defaultValue="setup" color="var(--gk-accent-primary)">
        <Tabs.List>
          <Tabs.Tab value="setup" leftSection={<IconPlugConnected size={15} />}>Setup</Tabs.Tab>
          <Tabs.Tab value="test-flow" leftSection={<IconCreditCard size={15} />}>Test Flow</Tabs.Tab>
          <Tabs.Tab value="subscribers" leftSection={<IconUsers size={15} />}>Subscribers</Tabs.Tab>
          <Tabs.Tab value="transactions" leftSection={<IconReceipt size={15} />}>Transactions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="setup" pt="md">
          <SetupTab />
        </Tabs.Panel>

        <Tabs.Panel value="test-flow">
          <TestFlowTab />
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
