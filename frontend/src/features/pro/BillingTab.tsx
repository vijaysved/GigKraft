import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

interface Subscription {
  plan: string;
  plan_label: string;
  status: string;
  renews_at: string | null;
  card_last4: string;
  monthly_value: number;
  coupon_code: string;
  discount_pct: number;
  stripe_subscription_id: string;
}

interface SubscriptionStatus {
  has_active_subscription: boolean;
  subscription: Subscription | null;
  stripe_mode: string;
}

interface Invoice {
  id: number;
  amount: number;
  status: string;
  period_label: string;
  issued_at: string;
}

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

const STATUS_COLOR: Record<string, string> = {
  active: "green",
  past_due: "orange",
  cancelled: "red",
  paid: "green",
  open: "orange",
  void: "gray",
};

export function BillingTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";

  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState(false);

  useEffect(() => {
    void fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [subRes, histRes] = await Promise.all([
        authFetch("/api/billing/subscription"),
        authFetch("/api/billing/history"),
      ]);
      if (subRes.ok) setSubStatus(await subRes.json() as SubscriptionStatus);
      if (histRes.ok) setInvoices(await histRes.json() as Invoice[]);
    } finally {
      setLoading(false);
    }
  }

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(false);
    try {
      const res = await authFetch("/api/billing/coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setCouponSuccess(true);
        setCouponInput("");
        await fetchAll();
      } else {
        const data = await res.json() as { detail?: string };
        setCouponError(data.detail ?? "Invalid coupon code.");
      }
    } catch {
      setCouponError("Network error. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function dismissCancelled() {
    const next = new URLSearchParams(searchParams);
    next.delete("cancelled");
    setSearchParams(next);
  }

  if (loading) return <Loader size="sm" mt="md" />;

  const sub = subStatus?.subscription;
  const isTestMode = subStatus?.stripe_mode === "test";

  return (
    <Stack mt="md" gap="md">
      {cancelled && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertCircle size={16} />}
          withCloseButton
          onClose={dismissCancelled}
        >
          Payment cancelled — you were not charged. Your account remains active.
        </Alert>
      )}

      {!subStatus?.has_active_subscription ? (
        /* ── No subscription ── */
        <Card withBorder radius="md" padding="xl" ta="center">
          <Stack align="center" gap="md">
            <IconCreditCard size={48} color="var(--gk-accent-primary)" />
            <Stack gap={4}>
              <Title order={4}>Upgrade to Pro</Title>
              <Text size="sm" c="dimmed">
                Publish unlimited Krafts, earn endorsements, and get found by homeowners in your area.
              </Text>
            </Stack>
            <Button
              onClick={() => navigate("/pro/checkout?plan=monthly")}
              style={{ background: "var(--gk-accent-primary)", color: "#fff" }}
            >
              Upgrade to Pro →
            </Button>
          </Stack>
        </Card>
      ) : (
        /* ── Active subscription ── */
        <>
          {/* Plan card */}
          <Card
            radius="md"
            padding="lg"
            style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2}>
                  <Text size="xs" fw={600} style={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current plan</Text>
                  <Title order={3} style={{ color: "#fff" }}>{sub?.plan_label ?? "GigKraft Pro"}</Title>
                </Stack>
                <Stack gap={4} align="flex-end">
                  <Badge
                    color={STATUS_COLOR[sub?.status ?? ""] ?? "gray"}
                    variant="filled"
                    size="sm"
                  >
                    {sub?.status ?? "—"}
                  </Badge>
                  {isTestMode && (
                    <Badge color="orange" variant="filled" size="xs">TEST MODE</Badge>
                  )}
                </Stack>
              </Group>

              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />

              <Group gap="xl" wrap="wrap">
                <Stack gap={0}>
                  <Text size="xs" style={{ opacity: 0.75 }}>Monthly value</Text>
                  <Text fw={700}>${sub?.monthly_value?.toFixed(2) ?? "—"}/mo</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" style={{ opacity: 0.75 }}>Next renewal</Text>
                  <Text fw={700}>{sub?.renews_at ?? "—"}</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" style={{ opacity: 0.75 }}>Card on file</Text>
                  <Text fw={700}>•••• •••• •••• {sub?.card_last4 || "—"}</Text>
                </Stack>
              </Group>

              <Box>
                <Button
                  size="sm"
                  variant="white"
                  onClick={() => navigate("/pro/checkout?plan=monthly")}
                  style={{ color: "var(--gk-accent-primary)" }}
                >
                  Change Plan →
                </Button>
              </Box>
            </Stack>
          </Card>

          {/* Coupon */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="xs">
              <Title order={6}>Coupon code</Title>
              {sub?.coupon_code ? (
                <Group gap="xs">
                  <Badge color="green" variant="light">{sub.coupon_code}</Badge>
                  <Text size="xs" c="dimmed">−{sub.discount_pct}% discount applied</Text>
                </Group>
              ) : (
                <Group gap="xs">
                  <TextInput
                    placeholder="Enter coupon code"
                    size="sm"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void applyCoupon(); }}
                    error={couponError ?? undefined}
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="sm"
                    variant="light"
                    loading={couponLoading}
                    onClick={() => void applyCoupon()}
                    disabled={!couponInput.trim()}
                  >
                    Apply
                  </Button>
                </Group>
              )}
              {couponSuccess && <Text size="xs" c="green">Coupon applied successfully!</Text>}
            </Stack>
          </Card>

          {/* Invoice history */}
          <Card withBorder radius="md" padding="md">
            <Stack gap="sm">
              <Title order={6}>Invoice history</Title>
              {invoices.length === 0 ? (
                <Text size="sm" c="dimmed">No invoices yet.</Text>
              ) : (
                <Table withRowBorders striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Period</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {invoices.map((inv) => (
                      <Table.Tr key={inv.id}>
                        <Table.Td>{inv.period_label}</Table.Td>
                        <Table.Td>{inv.issued_at}</Table.Td>
                        <Table.Td>${inv.amount.toFixed(2)}</Table.Td>
                        <Table.Td>
                          <Badge size="xs" color={STATUS_COLOR[inv.status] ?? "gray"} variant="light">
                            {inv.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
