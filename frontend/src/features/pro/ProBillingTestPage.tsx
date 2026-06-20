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
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconRefresh,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

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

const TEST_CARDS = [
  { number: "4242 4242 4242 4242", description: "Always succeeds" },
  { number: "4000 0000 0000 0002", description: "Always declined" },
  { number: "4000 0025 0000 3155", description: "Requires 3D Secure" },
];

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

export function ProBillingTestPage() {
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "annual" | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function loadStatus() {
    setLoadError(null);
    try {
      const [cfgRes, subRes] = await Promise.all([
        authFetch("/api/billing/config"),
        authFetch("/api/billing/subscription"),
      ]);
      if (!cfgRes.ok || !subRes.ok) throw new Error("Failed to load status");
      setConfig(await cfgRes.json() as BillingConfig);
      setSubStatus(await subRes.json() as SubscriptionStatus);
    } catch {
      setLoadError("Could not load billing status. Check your connection.");
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function startCheckout(plan: "monthly" | "annual") {
    setCheckoutLoading(plan);
    try {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; detail?: string };
      if (!res.ok || !data.url) {
        alert(data.detail ?? "Checkout failed");
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Network error");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function resetSubscription() {
    if (!confirm("Delete your subscription row? This cannot be undone.")) return;
    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await authFetch("/api/billing/subscription/reset", { method: "DELETE" });
      const data = await res.json() as { deleted?: number; detail?: string };
      if (!res.ok) {
        setResetMsg(data.detail ?? "Reset failed");
      } else {
        setResetMsg(`Reset complete — ${data.deleted ?? 0} row(s) deleted.`);
        await loadStatus();
      }
    } catch {
      setResetMsg("Network error during reset.");
    } finally {
      setResetLoading(false);
    }
  }

  const isTestMode = config?.stripe_mode === "test";

  return (
    <Stack maw={720}>
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={3}>Billing Test Console</Title>
          <Text size="sm" c="dimmed">E2E checkout testing — direct URL only, no nav link</Text>
        </Stack>
        <Button size="xs" variant="subtle" leftSection={<IconRefresh size={14} />} onClick={() => void loadStatus()}>
          Refresh
        </Button>
      </Group>

      {loadError && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>{loadError}</Alert>
      )}

      {!config ? (
        <Loader size="sm" />
      ) : (
        <>
          {/* ── Status panel ── */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="sm">
              <Title order={6}>Environment Status</Title>
              <Group gap="xs" wrap="wrap">
                <Badge
                  variant="filled"
                  color={isTestMode ? "orange" : "green"}
                >
                  Stripe: {config.stripe_mode.toUpperCase()}
                </Badge>
                <Badge
                  variant="filled"
                  color={config.webhook_secret_set ? "green" : "red"}
                >
                  Webhook secret: {config.webhook_secret_set ? "set" : "missing"}
                </Badge>
                <Badge
                  variant="filled"
                  color={config.resend_mock ? "orange" : "green"}
                >
                  Resend: {config.resend_mock ? "MOCK (console log)" : "LIVE"}
                </Badge>
              </Group>

              {!isTestMode && (
                <Alert color="red" variant="light" icon={<IconAlertCircle size={14} />} p="xs">
                  <Text size="xs">Stripe is in LIVE mode. Checkout will charge real cards.</Text>
                </Alert>
              )}
            </Stack>
          </Card>

          {/* ── Current subscription ── */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="sm">
              <Title order={6}>Current Subscription</Title>
              {subStatus?.has_active_subscription && subStatus.subscription ? (
                <Table withRowBorders={false}>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td c="dimmed" w={120}>Plan</Table.Td>
                      <Table.Td fw={600}>{subStatus.subscription.plan_label}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td c="dimmed">Status</Table.Td>
                      <Table.Td>
                        <Badge color={subStatus.subscription.status === "active" ? "green" : "orange"}>
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
                <Text size="sm" c="dimmed">No active subscription.</Text>
              )}
            </Stack>
          </Card>

          {/* ── Test cards (test mode only) ── */}
          {isTestMode && (
            <Card withBorder radius="md" padding="md">
              <Stack gap="sm">
                <Title order={6}>Test Cards</Title>
                <Text size="xs" c="dimmed">Use any future expiry date and any 3-digit CVV.</Text>
                <Stack gap="xs">
                  {TEST_CARDS.map((card) => (
                    <Group key={card.number} justify="space-between" align="center">
                      <Group gap="sm">
                        <Code style={{ fontSize: 14, letterSpacing: 1 }}>{card.number}</Code>
                        <Text size="xs" c="dimmed">{card.description}</Text>
                      </Group>
                      <CopyButton value={card.number.replace(/\s/g, "")}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Copied!" : "Copy"}>
                            <Button size="xs" variant="subtle" onClick={copy} p={4}>
                              {copied ? <IconCheck size={14} color="green" /> : <IconCopy size={14} />}
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

          {/* ── Checkout actions ── */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="sm">
              <Title order={6}>Start Checkout</Title>
              <Group gap="sm">
                <Button
                  leftSection={<IconShoppingCart size={16} />}
                  loading={checkoutLoading === "monthly"}
                  onClick={() => void startCheckout("monthly")}
                  style={{ background: "var(--gk-accent-primary)", color: "#fff" }}
                >
                  Monthly ($24.99/mo)
                </Button>
                <Button
                  leftSection={<IconShoppingCart size={16} />}
                  loading={checkoutLoading === "annual"}
                  onClick={() => void startCheckout("annual")}
                  variant="light"
                  color="blue"
                >
                  Annual ($249.99/yr)
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* ── Reset (test mode only) ── */}
          {isTestMode && (
            <Card withBorder radius="md" padding="md" style={{ borderColor: "var(--mantine-color-red-3)" }}>
              <Stack gap="sm">
                <Title order={6} c="red">Reset (test only)</Title>
                <Text size="sm" c="dimmed">
                  Deletes the local subscription row so you can re-test the full checkout flow with the same account.
                  Does not affect Stripe — cancel the Stripe subscription there separately if needed.
                </Text>
                {resetMsg && (
                  <Alert color={resetMsg.startsWith("Reset complete") ? "green" : "red"} variant="light" p="xs">
                    <Text size="xs">{resetMsg}</Text>
                  </Alert>
                )}
                <Box>
                  <Button
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={16} />}
                    loading={resetLoading}
                    onClick={() => void resetSubscription()}
                  >
                    Reset Subscription
                  </Button>
                </Box>
              </Stack>
            </Card>
          )}

          <Divider />
          <Text size="xs" c="dimmed">
            After checkout: you'll be redirected to /pro/billing/success where polling activates your account.
          </Text>
        </>
      )}
    </Stack>
  );
}
