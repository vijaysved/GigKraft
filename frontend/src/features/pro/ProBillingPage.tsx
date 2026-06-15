import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Allow the Stripe web component in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "pricing-table-id": string;
        "publishable-key": string;
        "client-reference-id"?: string;
      };
    }
  }
}

// Publishable keys are safe to expose in frontend code (they are not secrets)
const STRIPE_CONFIG = {
  test: {
    tableId: import.meta.env.VITE_STRIPE_TEST_PRICING_TABLE_ID as string,
    publishableKey: import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY as string,
  },
  live: {
    tableId: import.meta.env.VITE_STRIPE_LIVE_PRICING_TABLE_ID as string,
    publishableKey: import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY as string,
  },
};

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";

// ── types ──────────────────────────────────────────────────────────────────

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
  stripe_mode: "test" | "live";
}

interface Invoice {
  id: number;
  amount: number;
  status: string;
  period_label: string;
  issued_at: string;
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

async function fetchSubscription(): Promise<SubscriptionStatus> {
  const res = await authFetch("/api/billing/subscription");
  if (!res.ok) throw new Error("Failed to load subscription");
  return res.json() as Promise<SubscriptionStatus>;
}

async function fetchHistory(): Promise<Invoice[]> {
  const res = await authFetch("/api/billing/history");
  if (!res.ok) return [];
  return res.json() as Promise<Invoice[]>;
}

async function applyCoupon(code: string): Promise<Subscription> {
  const res = await authFetch("/api/billing/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const data = await res.json() as { detail?: string } & Partial<Subscription>;
  if (!res.ok) throw new Error(data.detail ?? "Invalid coupon");
  return data as Subscription;
}


// ── sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color = status === "active" ? "green" : status === "past_due" ? "orange" : "gray";
  return <Badge color={color} variant="filled" size="sm" w="fit-content">{status}</Badge>;
}

function StripePricingTable({ mode, userId }: { mode: "test" | "live"; userId?: number }) {
  const cfg = STRIPE_CONFIG[mode];
  if (!cfg.tableId || !cfg.publishableKey) {
    return (
      <Alert color="yellow" variant="light">
        Stripe pricing table not configured for <strong>{mode}</strong> mode.
        {mode === "live"
          ? " Add VITE_STRIPE_LIVE_PRICING_TABLE_ID and VITE_STRIPE_LIVE_PUBLISHABLE_KEY to your Vercel environment variables."
          : " Add VITE_STRIPE_TEST_PRICING_TABLE_ID and VITE_STRIPE_TEST_PUBLISHABLE_KEY to your .env file."}
      </Alert>
    );
  }
  return (
    <stripe-pricing-table
      pricing-table-id={cfg.tableId}
      publishable-key={cfg.publishableKey}
      client-reference-id={userId ? String(userId) : undefined}
    />
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function ProBillingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const fromCancel = searchParams.get("cancelled") === "1";

  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [waitingForWebhook, setWaitingForWebhook] = useState(!!sessionId);

  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 8; // ~16 seconds total

  useEffect(() => {
    void load();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  async function load(isPolling = false) {
    try {
      const [sub, hist] = await Promise.all([fetchSubscription(), fetchHistory()]);
      setStatus(sub);
      setInvoices(hist);

      // If we came back from Stripe with a session_id, poll until the webhook lands
      if (sessionId && !sub.has_active_subscription && isPolling) {
        pollAttemptsRef.current += 1;
        if (pollAttemptsRef.current < MAX_POLL_ATTEMPTS) {
          pollRef.current = setTimeout(() => void load(true), 2000);
        } else {
          setWaitingForWebhook(false); // gave up waiting
        }
      } else if (sessionId && sub.has_active_subscription) {
        setWaitingForWebhook(false);
        // Remove session_id from URL so refresh doesn't re-trigger
        setSearchParams({}, { replace: true });
      }
    } catch {
      setLoadError("Could not load billing information.");
    }
  }

  async function handleApplyCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await applyCoupon(coupon.trim());
      setCouponSuccess("Coupon applied!");
      setCoupon("");
      void load();
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  if (loadError) {
    return <Alert color="red">{loadError}</Alert>;
  }

  if (!status) {
    return <Loader size="sm" />;
  }

  const sub = status.subscription;
  const isActive = status.has_active_subscription;

  return (
    <Stack maw={600}>
      <Group gap="sm" align="center">
        <Title order={3}>Billing</Title>
        {status.stripe_mode === "test" && (
          <Badge color="orange" variant="filled" size="sm">Test mode</Badge>
        )}
      </Group>

      {/* ── Post-checkout banners ── */}
      {sessionId && waitingForWebhook && (
        <Alert color="blue" icon={<Loader size={14} />} title="Activating your subscription…">
          Payment received — activating your plan. This takes a moment.
        </Alert>
      )}
      {sessionId && !waitingForWebhook && isActive && sub && (
        <Alert color="green" icon={<IconCheck size={16} />} title="You're subscribed!">
          Welcome to <strong>{sub.plan_label}</strong>.{" "}
          {sub.renews_at && <>Your plan renews on <strong>{new Date(sub.renews_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.</>}
        </Alert>
      )}
      {fromCancel && (
        <Alert color="orange" icon={<IconX size={16} />} title="Payment cancelled" withCloseButton
          onClose={() => setSearchParams({}, { replace: true })}>
          No charge was made. You can subscribe any time below.
        </Alert>
      )}

      {/* ── Current plan (only if subscribed) ── */}
      {isActive && sub && (
        <Card withBorder radius="md" padding="lg" style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}>
          <Stack gap="xs">
            <Text size="sm" opacity={0.8}>Current plan</Text>
            <Title order={2} style={{ color: "#fff" }}>{sub.plan_label}</Title>
            <Text size="sm" opacity={0.8}>
              ${sub.monthly_value.toFixed(2)}/mo
              {sub.discount_pct > 0 && ` · ${sub.discount_pct}% discount applied`}
              {sub.renews_at && ` · Renews ${new Date(sub.renews_at).toLocaleDateString()}`}
            </Text>
            <StatusBadge status={sub.status} />
          </Stack>
        </Card>
      )}

      {/* ── Stripe pricing table (always shown — to subscribe or change plan) ── */}
      <Title order={5} c="dimmed">{isActive ? "Change plan" : "Choose your plan"}</Title>
      <StripePricingTable mode={status.stripe_mode} userId={undefined} />

      {/* ── Sections below only shown when subscribed ── */}
      {isActive && sub && (
        <>
          {/* Coupon */}
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Title order={5}>Apply coupon</Title>
              {sub.coupon_code && (
                <Text size="sm" c="dimmed">Active coupon: <Text span fw={600}>{sub.coupon_code}</Text> (−{sub.discount_pct}%)</Text>
              )}
              <Group gap="xs">
                <TextInput
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Button variant="light" loading={couponLoading} onClick={() => void handleApplyCoupon()}>
                  Apply
                </Button>
              </Group>
              {couponError && <Text size="sm" c="red">{couponError}</Text>}
              {couponSuccess && <Text size="sm" c="green">{couponSuccess}</Text>}
            </Stack>
          </Card>

          {/* Payment method */}
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Title order={5}>Payment method</Title>
              {sub.card_last4 ? (
                <Group gap="xs">
                  <Text size="sm">•••• •••• •••• {sub.card_last4}</Text>
                </Group>
              ) : (
                <Text size="sm" c="dimmed">No card on file.</Text>
              )}
              <Button
                variant="light"
                size="sm"
                w="fit-content"
                onClick={() => {
                  // TODO: redirect to Stripe customer portal for card update
                  alert("Stripe customer portal coming soon.");
                }}
              >
                Update card
              </Button>
            </Stack>
          </Card>

          {/* Billing history */}
          <Card withBorder radius="md" padding="lg">
            <Stack>
              <Title order={5}>Billing history</Title>
              <Divider />
              {invoices.length === 0 ? (
                <Text size="sm" c="dimmed">No invoices yet.</Text>
              ) : (
                invoices.map((inv) => (
                  <Group key={inv.id} justify="space-between">
                    <Text size="sm">{inv.period_label || new Date(inv.issued_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Text>
                    <Group gap="xs">
                      <Text size="sm" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        ${inv.amount.toFixed(2)}
                      </Text>
                      <Badge size="xs" color={inv.status === "paid" ? "green" : "orange"}>{inv.status}</Badge>
                    </Group>
                  </Group>
                ))
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
