import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CopyButton,
  Drawer,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {
  IconArrowsSort,
  IconBrandWhatsapp,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClockHour4,
  IconCopy,
  IconEdit,
  IconMail,
  IconMailOpened,
  IconMessage,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconFileText,
  IconUpload,
  IconWorld,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  advanceProspectStep,
  checkProspectDuplicates,
  createProspect,
  deleteProspect,
  getProspectAnalytics,
  listProspects,
  startProspectSequence,
  updateProspect,
  listTemplates,
  createTemplate,
  updateTemplate,
  sendProspectStep,
  ApiError,
  type BulkPreviewOut,
  type BulkPreviewResult,
} from "../../api/endpoints";
import { notifications } from "@mantine/notifications";
import type {
  Prospect,
  ProspectAnalytics,
  ProspectIn,
  StepJourney,
  MessageTemplate,
  TemplateIn,
} from "../../api/endpoints";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  prospect: "blue",
  interested: "cyan",
  in_progress: "yellow",
  converted: "green",
  on_hold: "orange",
  abandoned: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  interested: "Interested",
  in_progress: "In Progress",
  converted: "Converted",
  on_hold: "On Hold",
  abandoned: "Abandoned",
};

const SOURCE_COLORS: Record<string, string> = {
  nextdoor: "teal",
  craigslist: "violet",
  whatsapp: "green",
  direct: "blue",
};

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "interested", label: "Interested" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "on_hold", label: "On Hold" },
  { value: "abandoned", label: "Abandoned" },
];

const SOURCE_OPTIONS = [
  { value: "nextdoor", label: "Nextdoor" },
  { value: "craigslist", label: "Craigslist" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "direct", label: "Direct" },
];

const CHAT_TEMPLATES: Record<number, (p: Prospect) => string> = {
  1: (p) =>
    `Hi ${p.name}! Noticed your excellent work on ${p.source}. I'm Vijay, admin for *gigKraft.com*—a local trust network for pros in ${p.primary_zip}. We build sovereign digital portfolios for independent contractors. No lead fees or hidden cuts—just your own verified link to show clients. It's *$24.99/mo* or *$249.99/yr* flat.\n\nIf you'd like to reserve your profile link, check it out here: ${buildSignupUrl()}`,
  2: (p) =>
    `Hey ${p.name}, just following up! Local pros are loving *gigKraft.com* because they fully own their reviews and portfolio link, bypassing unpredictable platform algorithms. Great for dropping directly into your WhatsApp groups or Nextdoor replies.\n\nSet up your verified local profile in 2 mins: ${buildSignupUrl()}`,
  3: (p) =>
    `Hi ${p.name}, closing out your pending invite for now so I don't bug you. If you ever want to stand out to nearby homeowners with a clean profile for *$24.99/mo*, you can unlock it anytime here: ${buildSignupUrl()}. Wish you all the best!`,
};

function buildSignupUrl(): string {
  return "https://www.gigkraft.com/for-pros";
}

function buildWaUrl(phone: string, text?: string | null): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.length === 10 ? `1${digits}` : digits;
  const base = `https://wa.me/${num}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function renderTemplate(body: string, p: Prospect): string {
  return body
    .replace(/\{\{name\}\}/g, p.name)
    .replace(/\{\{source\}\}/g, p.source)
    .replace(/\{\{neighborhood\}\}/g, p.neighborhood || p.primary_zip || "")
    .replace(/\{\{primaryZip\}\}/g, p.primary_zip || "")
    .replace(/\{\{signup_link\}\}/g, buildSignupUrl())
    .replace(/\{\{contact_person\}\}/g, "Vijay")
    .replace(/\{\{business_name\}\}/g, "GigKraft")
    .replace(/\{\{prospect_id\}\}/g, p.prospect_id);
}

const TEMPLATE_STEP_LABELS = ["Check Out the Site", "Share Pricing", "Offer a Call"];

const DEFAULT_TEMPLATES: TemplateIn[] = [
  {
    name: "Email — Step 1",
    channel: "email",
    kind: "sequence_1",
    subject: "Your GigKraft Profile Invite — {{name}}",
    body: "Hi {{name}},\n\nI came across your work on {{source}} and wanted to personally invite you to check out GigKraft.com — a local trust network for pros in {{neighborhood}}.\n\nWe help independent contractors build sovereign digital portfolios. No lead fees, no hidden cuts — just your own verified profile link for a flat $24.99/mo or $249.99/yr.\n\nCheck it out here: {{signup_link}}\n\nAny questions? Just reply to this email or reach out to Vijay directly.\n\nBest,\nVijay\ngigKraft.com",
    is_default: true,
  },
  {
    name: "Email — Step 2",
    channel: "email",
    kind: "sequence_2",
    subject: "GigKraft Pricing Breakdown — {{name}}",
    body: "Hi {{name}},\n\nFollowing up on your GigKraft invite! Here's a quick pricing breakdown:\n\n• $24.99/month — cancel anytime\n• $249.99/year — save ~17%\n• Your own verified profile link you fully own\n• No platform fees or lead cuts\n• Reviews you control\n\nSet up your profile in minutes: {{signup_link}}\n\nBest,\nVijay\ngigKraft.com",
    is_default: true,
  },
  {
    name: "Email — Step 3",
    channel: "email",
    kind: "sequence_3",
    subject: "Quick call about GigKraft? — {{name}}",
    body: "Hi {{name}},\n\nOne last follow-up! I'd love to hop on a quick call to answer any questions about GigKraft and how it could help your business in {{neighborhood}}.\n\nYour invite is still active: {{signup_link}}\n\nFeel free to reply anytime or reach out to Vijay — no pressure at all.\n\nBest,\nVijay\ngigKraft.com",
    is_default: true,
  },
  {
    name: "WhatsApp — Step 1",
    channel: "whatsapp",
    kind: "sequence_1",
    subject: "",
    body: "Hi {{name}}! Noticed your excellent work on {{source}}. I'm Vijay, admin for *gigKraft.com* — a local trust network for pros in {{neighborhood}}. We build sovereign digital portfolios for independent contractors. No lead fees or hidden cuts — just your own verified link for $24.99/mo or $249.99/yr.\n\nCheck it out and reach out if you have any questions: {{signup_link}}",
    is_default: true,
  },
  {
    name: "WhatsApp — Step 2",
    channel: "whatsapp",
    kind: "sequence_2",
    subject: "",
    body: "Hey {{name}}, just sharing a quick pricing breakdown for *GigKraft.com*:\n\n• $24.99/month or $249.99/year\n• Your own verified local profile link\n• No lead fees or platform cuts\n\nLocal pros love dropping their GigKraft link in WhatsApp groups or Nextdoor replies. Set up in 2 mins: {{signup_link}}",
    is_default: true,
  },
  {
    name: "WhatsApp — Step 3",
    channel: "whatsapp",
    kind: "sequence_3",
    subject: "",
    body: "Hi {{name}}, closing out your pending invite so I don't keep bugging you! If you ever want to stand out to nearby homeowners with a clean verified profile, you can unlock it anytime: {{signup_link}}\n\nFeel free to reach out to Vijay if you have any questions. Wishing you all the best!",
    is_default: true,
  },
];

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ── Journey Blocks ────────────────────────────────────────────────────────────

function JourneyBlocks({
  journey,
  currentStep,
  onResend,
}: {
  journey: StepJourney[];
  currentStep: number;
  onResend?: (step: number, channel: "email" | "whatsapp" | "sms") => void;
}) {
  const steps: StepJourney[] = journey.length === 3 ? journey : [
    { step: 1, sent_at: null, channel: null, read_at: null, email_count: 0, whatsapp_count: 0 },
    { step: 2, sent_at: null, channel: null, read_at: null, email_count: 0, whatsapp_count: 0 },
    { step: 3, sent_at: null, channel: null, read_at: null, email_count: 0, whatsapp_count: 0 },
  ];

  return (
    <Group gap={4} wrap="nowrap">
      {steps.map((s) => {
        const sent = !!s.sent_at;
        const opened = sent && s.channel === "email" && !!s.read_at;
        const emailSent = sent && s.channel === "email" && !s.read_at;
        const waSent = sent && s.channel === "whatsapp";
        const smsSent = sent && s.channel === "sms";
        const isCurrent = s.step === currentStep && sent;
        const totalSent = (s.email_count ?? 0) + (s.whatsapp_count ?? 0);

        let bg = "var(--mantine-color-default-border)";
        let iconColor = "var(--mantine-color-dimmed)";
        if (opened) {
          bg = "var(--gk-accent-primary)";
          iconColor = "#000";
        } else if (emailSent) {
          bg = "var(--mantine-color-yellow-5)";
          iconColor = "#000";
        } else if (waSent) {
          bg = "var(--mantine-color-teal-5)";
          iconColor = "#fff";
        } else if (smsSent) {
          bg = "var(--mantine-color-blue-5)";
          iconColor = "#fff";
        }

        const countParts: string[] = [];
        if ((s.email_count ?? 0) > 0) countParts.push(`email ×${s.email_count}`);
        if ((s.whatsapp_count ?? 0) > 0) countParts.push(`WA ×${s.whatsapp_count}`);
        const countLabel = countParts.length > 0 ? ` (${countParts.join(", ")})` : "";
        const resendHint = onResend && sent ? " · click to resend" : "";

        const tooltip = opened
          ? `Step ${s.step}: Email opened ✓${countLabel}${resendHint}`
          : emailSent
          ? `Step ${s.step}: Email sent${countLabel}${resendHint}`
          : waSent
          ? `Step ${s.step}: WhatsApp sent ✓${countLabel}${resendHint}`
          : smsSent
          ? `Step ${s.step}: Text sent ✓${countLabel}${resendHint}`
          : `Step ${s.step}: Not started`;

        const handleClick = () => {
          if (!onResend || !sent) return;
          const ch = s.channel === "sms" ? "sms" : s.channel === "whatsapp" ? "whatsapp" : "email";
          onResend(s.step, ch as "email" | "whatsapp" | "sms");
        };

        return (
          <Tooltip key={s.step} label={tooltip} withArrow>
            <Box
              onClick={handleClick}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                outline: isCurrent ? "2px solid var(--gk-accent-primary)" : "none",
                outlineOffset: 2,
                transition: "background 0.2s",
                cursor: onResend && sent ? "pointer" : "default",
                position: "relative",
              }}
            >
              {opened ? (
                <IconMailOpened size={11} color={iconColor} />
              ) : emailSent ? (
                <IconMail size={11} color={iconColor} />
              ) : waSent ? (
                <IconBrandWhatsapp size={11} color={iconColor} />
              ) : smsSent ? (
                <IconMessage size={11} color={iconColor} />
              ) : (
                <Text size="xs" fw={700} style={{ color: iconColor, lineHeight: 1, fontSize: 10 }}>
                  {s.step}
                </Text>
              )}
              {onResend && sent && totalSent > 1 && (
                <Box style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "var(--mantine-color-gray-6)",
                  borderRadius: "50%",
                  width: 11,
                  height: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 7, color: "#fff", lineHeight: 1, fontWeight: 700 }}>{totalSent}</Text>
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Group>
  );
}

// ── Sortable Header ───────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

function SortTh({
  col,
  sortBy,
  sortDir,
  onSort,
  children,
  minWidth,
}: {
  col: string;
  sortBy: string | null;
  sortDir: SortDir;
  onSort: (col: string) => void;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const active = sortBy === col;
  return (
    <Table.Th
      style={{
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth: minWidth ?? 70,
        background: active ? "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)" : undefined,
      }}
      onClick={() => onSort(col)}
    >
      <Group gap={3} wrap="nowrap">
        <span>{children}</span>
        {active ? (
          sortDir === "asc" ? (
            <IconChevronUp size={11} color="var(--gk-accent-primary)" />
          ) : (
            <IconChevronDown size={11} color="var(--gk-accent-primary)" />
          )
        ) : (
          <IconArrowsSort size={10} style={{ opacity: 0.3 }} />
        )}
      </Group>
    </Table.Th>
  );
}

function useSort<T>(data: T[], initial: keyof T | null = null, initialDir: SortDir = "asc") {
  const [sortBy, setSortBy] = useState<string | null>(initial as string | null);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggle = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortBy] ?? "");
      const bv = String((b as Record<string, unknown>)[sortBy] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortBy, sortDir]);

  return { sorted, sortBy, sortDir, toggle };
}

// ── Rounded Table Wrapper ─────────────────────────────────────────────────────

function TableBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--gk-border)",
        background: "var(--gk-bg-surface)",
      }}
    >
      {children}
    </Box>
  );
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────

const STATUS_PIE: Record<string, { label: string; color: string }> = {
  prospect:    { label: "Prospect",    color: "#4DABF7" },
  interested:  { label: "Interested",  color: "#22B8CF" },
  in_progress: { label: "In Progress", color: "#FFD43B" },
  converted:   { label: "Converted",   color: "#69DB7C" },
  on_hold:     { label: "On Hold",     color: "#FFA94D" },
  abandoned:   { label: "Abandoned",   color: "#ADB5BD" },
};

const SOURCE_PIE: Record<string, { label: string; color: string }> = {
  nextdoor:   { label: "Nextdoor",   color: "#20C997" },
  craigslist: { label: "Craigslist", color: "#9775FA" },
  whatsapp:   { label: "WhatsApp",   color: "#51CF66" },
  direct:     { label: "Direct",     color: "#4DABF7" },
};

const CHANNEL_PIE: Record<string, { label: string; color: string }> = {
  email:    { label: "Email",    color: "#4DABF7" },
  whatsapp: { label: "WhatsApp", color: "#20C997" },
  sms:      { label: "Text",     color: "#748FFC" },
};

function PieChartCard({ title, data }: {
  title: string;
  data: Array<{ name: string; value: number; color: string }>;
}) {
  const filtered = data.filter((d) => d.value > 0);
  const total = filtered.reduce((sum, d) => sum + d.value, 0);
  return (
    <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
      <Text fw={600} mb="md">{title}</Text>
      {filtered.length === 0 ? (
        <Text size="sm" c="dimmed">No data yet.</Text>
      ) : (
        <Group gap="lg" align="flex-start" wrap="nowrap">
          <RechartsPieChart width={130} height={130} style={{ flexShrink: 0 }}>
            <Pie
              data={filtered}
              cx={60}
              cy={60}
              innerRadius={34}
              outerRadius={58}
              dataKey="value"
              strokeWidth={0}
            >
              {filtered.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <RechartsTooltip />
          </RechartsPieChart>
          <Stack gap={6} style={{ flex: 1 }}>
            {filtered.map((d) => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
              return (
                <Group key={d.name} justify="space-between" wrap="nowrap">
                  <Group gap={6} wrap="nowrap">
                    <Box style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                    <Text size="xs">{d.name}</Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <Text size="xs" fw={600}>{d.value}</Text>
                    <Text size="xs" c="dimmed">({pct}%)</Text>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        </Group>
      )}
    </Card>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>{label}</Text>
      <Text
        size="xl"
        fw={700}
        style={{ color: accent ? "var(--gk-accent-primary)" : undefined }}
      >
        {value}
      </Text>
    </Card>
  );
}

function DashboardTab() {
  const [analytics, setAnalytics] = useState<ProspectAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProspectAnalytics()
      .then(setAnalytics)
      .catch(() => setError("Failed to load analytics."));
  }, []);

  if (error) return <Alert color="red">{error}</Alert>;
  if (!analytics) return <Loader size="sm" />;

  const statusData = Object.entries(analytics.by_status).map(([s, count]) => ({
    name: STATUS_PIE[s]?.label ?? s,
    value: count,
    color: STATUS_PIE[s]?.color ?? "#ADB5BD",
  }));

  const sourceData = Object.entries(analytics.by_source).map(([src, count]) => ({
    name: SOURCE_PIE[src]?.label ?? src,
    value: count,
    color: SOURCE_PIE[src]?.color ?? "#ADB5BD",
  }));

  const channelData = Object.entries(analytics.by_channel ?? {}).map(([ch, count]) => ({
    name: CHANNEL_PIE[ch]?.label ?? ch,
    value: count,
    color: CHANNEL_PIE[ch]?.color ?? "#ADB5BD",
  }));

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KpiCard label="Total Prospects" value={analytics.total} accent />
        <KpiCard label="New (7 days)" value={analytics.new_7_days} />
        <KpiCard label="Conversion Rate" value={`${analytics.conversion_rate}%`} accent />
        <KpiCard label="Link CTR" value={`${analytics.link_ctr}%`} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <PieChartCard title="Status Funnel" data={statusData} />
        <PieChartCard title="Source Breakdown" data={sourceData} />
        <PieChartCard title="Channel Mix" data={channelData} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
          <Text fw={600} mb="md">Active Sequence Steps</Text>
          <Stack gap="xs">
            {Object.entries(analytics.by_sequence_step).map(([step, count]) => (
              <Group key={step} justify="space-between">
                <Group gap={6}>
                  <Text size="sm" c="dimmed">Step {step}</Text>
                  <JourneyBlocks
                    journey={[
                      { step: 1, sent_at: Number(step) >= 1 ? "x" : null, channel: "email", read_at: null, email_count: 0, whatsapp_count: 0 },
                      { step: 2, sent_at: Number(step) >= 2 ? "x" : null, channel: "email", read_at: null, email_count: 0, whatsapp_count: 0 },
                      { step: 3, sent_at: Number(step) >= 3 ? "x" : null, channel: "email", read_at: null, email_count: 0, whatsapp_count: 0 },
                    ]}
                    currentStep={Number(step)}
                  />
                </Group>
                <Badge variant="outline" style={{ borderColor: "var(--gk-border)" }}>{count} prospects</Badge>
              </Group>
            ))}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
          <Text fw={600} mb="md">Recent Conversions</Text>
          {analytics.recent_conversions.length === 0 ? (
            <Text size="sm" c="dimmed">No conversions yet.</Text>
          ) : (
            <Stack gap="xs">
              {analytics.recent_conversions.map((c) => (
                <Group key={c.id} justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <IconUserCheck size={14} color="var(--gk-accent-primary)" />
                    <Text size="sm" fw={500}>{c.name}</Text>
                    <Badge color={SOURCE_COLORS[c.source] ?? "gray"} size="xs" variant="light">
                      {c.source}
                    </Badge>
                  </Group>
                  {c.converted_user_id && (
                    <Text size="xs" c="dimmed">User #{c.converted_user_id}</Text>
                  )}
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

// ── Chat Step Modal ───────────────────────────────────────────────────────────

type ChatChannel = "whatsapp" | "sms";

function getLastChannel(prospectId: number): ChatChannel | null {
  return localStorage.getItem(`gk-ch-${prospectId}`) as ChatChannel | null;
}

function ChatStepModal({
  prospect,
  opened,
  onClose,
  onSent,
  templateBody,
}: {
  prospect: Prospect;
  opened: boolean;
  onClose: () => void;
  onSent: (updated: Prospect) => void;
  templateBody?: string;
}) {
  const nextStep =
    prospect.current_sequence_step === 0 ? 1 : Math.min(prospect.current_sequence_step + 1, 3);
  const text = templateBody
    ? renderTemplate(templateBody, prospect)
    : (CHAT_TEMPLATES[nextStep]?.(prospect) ?? "");

  const [confirming, setConfirming] = useState<ChatChannel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastChannel = getLastChannel(prospect.id);

  const handleConfirm = async (channel: ChatChannel) => {
    setConfirming(channel);
    setError(null);
    try {
      // Backend now stores the correct channel in the OutreachLog and journey
      const updated = await advanceProspectStep(prospect.id, channel);
      localStorage.setItem(`gk-ch-${prospect.id}`, channel);
      onSent(updated);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to confirm.");
    } finally {
      setConfirming(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Chat Step ${nextStep} — ${prospect.name}`}
      size="lg"
    >
      <Stack gap="sm">
        {prospect.phone && (
          <Group
            justify="space-between"
            align="center"
            p="sm"
            style={{
              background: "color-mix(in srgb, var(--mantine-color-gray-5) 8%, var(--gk-bg-surface))",
              borderRadius: 8,
              border: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Text size="sm" fw={600}>{prospect.phone}</Text>
            <CopyButton value={prospect.phone} timeout={2000}>
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  radius="xl"
                  variant="light"
                  color={copied ? "green" : "gray"}
                  leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  onClick={copy}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </CopyButton>
          </Group>
        )}

        <Textarea
          value={text}
          readOnly
          autosize
          minRows={5}
          styles={{ input: { fontFamily: "monospace", fontSize: 12 } }}
        />

        <Group justify="space-between" align="center">
          <CopyButton value={text} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                size="xs"
                radius="xl"
                leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                onClick={copy}
                variant={copied ? "light" : "filled"}
                color={copied ? "green" : undefined}
                style={copied ? {} : { background: "var(--gk-accent-primary)", color: "#000" }}
              >
                {copied ? "Copied!" : "Copy Message"}
              </Button>
            )}
          </CopyButton>

          <Group gap="xs">
            <Button
              size="xs"
              radius="xl"
              variant={lastChannel === "whatsapp" ? "filled" : "light"}
              color="teal"
              leftSection={<IconBrandWhatsapp size={12} />}
              loading={confirming === "whatsapp"}
              disabled={confirming === "sms"}
              onClick={() => handleConfirm("whatsapp")}
            >
              Confirmed via WhatsApp
            </Button>
            <Button
              size="xs"
              radius="xl"
              variant={lastChannel === "sms" ? "filled" : "light"}
              color="blue"
              leftSection={<IconMessage size={12} />}
              loading={confirming === "sms"}
              disabled={confirming === "whatsapp"}
              onClick={() => handleConfirm("sms")}
            >
              Confirmed via Text
            </Button>
          </Group>
        </Group>

        {error && <Alert color="red">{error}</Alert>}
      </Stack>
    </Modal>
  );
}

// ── Prospect Form Drawer ──────────────────────────────────────────────────────

function parseProspectText(text: string): Partial<ProspectIn> {
  const out: Partial<ProspectIn> = {};

  const emailM = text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/);
  if (emailM) out.email = emailM[0].trim();

  const phoneM = text.match(/(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneM) out.phone = phoneM[0].trim();

  const zipM = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipM) out.primary_zip = zipM[1];

  const labelM = text.match(/(?:^|\n)(?:name|contact|from)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/im);
  if (labelM) { out.name = labelM[1].trim(); }

  if (!out.name) {
    const introM = text.match(/(?:i'?m|i am|my name is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (introM) out.name = introM[1].trim();
  }

  if (!out.name) {
    for (const line of text.split(/\n/)) {
      const t = line.trim();
      if (/^[A-Z][a-z]{1,20}(?:\s[A-Z][a-z]{1,20}){1,2}$/.test(t)) {
        out.name = t;
        break;
      }
    }
  }

  if (!out.name) {
    const twoM = text.match(/\b([A-Z][a-z]{1,20}\s[A-Z][a-z]{1,20})\b/);
    if (twoM) out.name = twoM[1];
  }

  return out;
}

interface BulkProspect {
  name: string;
  email: string;
  phone: string;
  url: string;
}

const _BULK_PHONE = /(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const _BULK_EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const _BULK_URL = /https?:\/\/[^\s)\]>"]+/;

function extractLineProspect(line: string): BulkProspect {
  const phoneM = line.match(_BULK_PHONE);
  const emailM = line.match(_BULK_EMAIL);
  const urlM = line.match(_BULK_URL);
  const name = line
    .replace(_BULK_PHONE, "")
    .replace(_BULK_EMAIL, "")
    .replace(_BULK_URL, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-·,\s]+|[-·,\s]+$/g, "")
    .trim();
  return { name, email: emailM?.[0] ?? "", phone: phoneM?.[0] ?? "", url: urlM?.[0] ?? "" };
}

function parseBulkText(text: string): BulkProspect[] {
  if (!text.trim()) return [];

  const nonEmptyLines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Detect "one prospect per line" format: no blank-line separators and most
  // lines carry a phone or email directly on the same line as the name.
  let blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length <= 1 && nonEmptyLines.length >= 2) {
    const contactLines = nonEmptyLines.filter((l) => _BULK_PHONE.test(l) || _BULK_EMAIL.test(l));
    if (contactLines.length >= Math.ceil(nonEmptyLines.length / 2)) {
      return nonEmptyLines
        .map(extractLineProspect)
        .filter((p) => p.name || p.email || p.phone);
    }
  }

  // Numbered list fallback
  if (blocks.length <= 1) {
    const numbered = text.split(/(?=(?:^|\n)\d+[.)]\s)/m).map((b) => b.trim()).filter(Boolean);
    if (numbered.length > 1) blocks = numbered;
  }

  // Paragraph-block parsing (multi-line entries separated by blank lines)
  return blocks
    .map((block) => {
      const emailM = block.match(_BULK_EMAIL);
      const phoneM = block.match(_BULK_PHONE);
      const urlM = block.match(_BULK_URL);

      let name = "";

      const labelM = block.match(/(?:^|\n)(?:name|contact|from)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/im);
      if (labelM) name = labelM[1].trim();

      if (!name) {
        const introM = block.match(/(?:i'?m|i am|my name is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
        if (introM) name = introM[1].trim();
      }

      if (!name) {
        const firstLine = block.split("\n")[0].trim().replace(/^\d+[.)]\s+/, "");
        const namePart = firstLine.split(/\s*[-·|,]\s*/)[0].trim();
        if (/^[A-Z][a-z]{1,25}(?:\s[A-Z][a-z]{1,25}){1,2}$/.test(namePart)) {
          name = namePart;
        } else if (/^[A-Z][a-z]{1,25}(?:\s[A-Z][a-z]{1,25}){1,2}$/.test(firstLine)) {
          name = firstLine;
        } else {
          const stripped = firstLine
            .replace(_BULK_PHONE, "").replace(_BULK_EMAIL, "").replace(_BULK_URL, "")
            .replace(/\s+/g, " ").trim().replace(/^[-·,\s]+|[-·,\s]+$/g, "").trim();
          if (stripped && !/[@\d]/.test(stripped)) name = stripped;
        }
      }

      if (!name) {
        for (const line of block.split("\n").slice(1)) {
          const t = line.trim();
          if (/^[A-Z][a-z]{1,25}(?:\s[A-Z][a-z]{1,25}){1,2}$/.test(t)) {
            name = t;
            break;
          }
        }
      }

      if (!name) {
        const anyM = block.match(/\b([A-Z][a-z]{2,15}\s[A-Z][a-z]{2,15})\b/);
        if (anyM) name = anyM[1];
      }

      return { name, email: emailM?.[0] ?? "", phone: phoneM?.[0] ?? "", url: urlM?.[0] ?? "" };
    })
    .filter((p) => p.name || p.email || p.phone);
}

// ── Bulk Upload Panel ─────────────────────────────────────────────────────────

function BulkUploadPanel({
  onSaved,
  onClose,
}: {
  onSaved: (p: Prospect) => void;
  onClose: () => void;
}) {
  const [rawText, setRawText] = useState("");
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState("nextdoor");
  const [preview, setPreview] = useState<BulkPreviewOut | null>(null);

  const parsed = useMemo(() => parseBulkText(rawText), [rawText]);

  // Reset preview whenever the pasted text changes
  const handleTextChange = (text: string) => {
    setRawText(text);
    setPreview(null);
    setError(null);
  };

  const handleCheck = async () => {
    if (parsed.length === 0) return;
    setChecking(true);
    setError(null);
    try {
      const result = await checkProspectDuplicates(
        parsed.map((p) => ({ name: p.name || "Unknown", email: p.email || "", phone: p.phone || "" })),
      );
      setPreview(result);
    } catch {
      setError("Failed to check for duplicates. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSaveAll = async () => {
    if (!preview) return;
    const toAdd = parsed.filter((_, i) => !preview.results[i]?.is_duplicate);
    if (toAdd.length === 0) return;
    setSaving(true);
    setError(null);
    const failed: string[] = [];
    try {
      for (const p of toAdd) {
        try {
          const result = await createProspect({
            name: p.name || "Unknown",
            email: p.email || undefined,
            phone: p.phone || undefined,
            source,
            role: "pro",
            notes: p.url ? `URL: ${p.url}` : undefined,
          } as ProspectIn);
          onSaved(result);
        } catch {
          failed.push(p.name || p.email || p.phone || "unknown");
        }
      }
      if (failed.length > 0) {
        setError(`Failed to save: ${failed.join(", ")}`);
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const dupSet = useMemo<Set<number>>(() => {
    if (!preview) return new Set();
    return new Set(preview.results.filter((r: BulkPreviewResult) => r.is_duplicate).map((r: BulkPreviewResult) => r.index));
  }, [preview]);

  return (
    <Stack>
      {parsed.length > 0 && (
        <>
          {preview && (
            <Group gap="xs">
              <Badge color="gray" variant="light">{preview.total} total</Badge>
              <Badge color="green" variant="light">{preview.new_count} new</Badge>
              {preview.existing_count > 0 && (
                <Badge color="orange" variant="light">{preview.existing_count} already exist</Badge>
              )}
            </Group>
          )}
          <TableBox>
            <Table fz="xs" verticalSpacing={4}>
              <Table.Thead
                style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}
              >
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>URL</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parsed.map((p, i) => {
                  const isDup = dupSet.has(i);
                  return (
                    <Table.Tr
                      key={i}
                      style={isDup ? { opacity: 0.5, background: "color-mix(in srgb, orange 8%, transparent)" } : undefined}
                    >
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <Text size="xs" fw={p.name ? 500 : undefined} c={p.name ? undefined : "dimmed"}>
                            {p.name || "—"}
                          </Text>
                          {isDup && (
                            <Badge size="xs" color="orange" variant="light">exists</Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c={p.email ? undefined : "dimmed"}>{p.email || "—"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c={p.phone ? undefined : "dimmed"}>{p.phone || "—"}</Text>
                      </Table.Td>
                      <Table.Td>
                        {p.url ? (
                          <Text size="xs" truncate style={{ maxWidth: 110 }} title={p.url}>
                            {p.url}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </TableBox>
        </>
      )}
      <Textarea
        placeholder={
          "Paste multiple contacts — one blank line between each.\n\nJohn Smith\n(555) 123-4567\njohn@example.com\nhttps://johnpainting.com\n\nJane Doe\n(555) 987-6543\njane@example.com"
        }
        value={rawText}
        onChange={(e) => handleTextChange(e.target.value)}
        autosize
        minRows={parsed.length > 0 ? 5 : 12}
        styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
      />
      <Select
        label="Source"
        data={SOURCE_OPTIONS}
        value={source}
        onChange={(v) => setSource(v ?? "nextdoor")}
        size="xs"
      />
      {error && <Alert color="red">{error}</Alert>}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        {!preview ? (
          <Button
            onClick={handleCheck}
            loading={checking}
            disabled={parsed.length === 0}
            style={parsed.length > 0 ? { background: "var(--gk-accent-primary)", color: "#000" } : undefined}
          >
            {parsed.length > 0
              ? `Check ${parsed.length} Prospect${parsed.length !== 1 ? "s" : ""}`
              : "Check Prospects"}
          </Button>
        ) : (
          <Button
            onClick={handleSaveAll}
            loading={saving}
            disabled={preview.new_count === 0}
            style={preview.new_count > 0 ? { background: "var(--gk-accent-primary)", color: "#000" } : undefined}
          >
            {preview.new_count > 0
              ? `Add ${preview.new_count} New Prospect${preview.new_count !== 1 ? "s" : ""}`
              : "No New Prospects"}
          </Button>
        )}
      </Group>
    </Stack>
  );
}

function ProspectDrawer({
  opened,
  onClose,
  prospect,
  onSaved,
}: {
  opened: boolean;
  onClose: () => void;
  prospect: Prospect | null;
  onSaved: (p: Prospect) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("paste");
  const [rawText, setRawText] = useState("");
  const [form, setForm] = useState<Partial<ProspectIn>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setActiveTab("paste");
      setRawText("");
      setForm(
        prospect
          ? {
              name: prospect.name,
              email: prospect.email,
              phone: prospect.phone,
              role: prospect.role,
              primary_zip: prospect.primary_zip,
              neighborhood: prospect.neighborhood,
              source: prospect.source,
              notes: prospect.notes,
            }
          : { source: "nextdoor", role: "pro" },
      );
      setError(null);
    }
  }, [opened, prospect]);

  const f = (k: keyof ProspectIn) => (val: string | null) =>
    setForm((prev) => ({ ...prev, [k]: val ?? "" }));

  const handleParse = () => {
    const parsed = parseProspectText(rawText);
    setForm((prev) => ({ ...prev, ...parsed }));
    setActiveTab("form");
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("Name is required."); return; }
    if (!form.email?.trim() && !form.phone?.trim()) {
      setError("Email or phone is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = prospect
        ? await updateProspect(prospect.id, form)
        : await createProspect(form as ProspectIn);
      onSaved(result);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const formFields = (
    <Stack>
      <TextInput label="Name" required value={form.name ?? ""} onChange={(e) => f("name")(e.target.value)} />
      <TextInput label="Email" value={form.email ?? ""} onChange={(e) => f("email")(e.target.value)} />
      <TextInput label="Phone" placeholder="e.g. (555) 123-4567 or +1 555 123 4567" value={form.phone ?? ""} onChange={(e) => f("phone")(e.target.value)} />
      <TextInput label="Primary ZIP" value={form.primary_zip ?? ""} onChange={(e) => f("primary_zip")(e.target.value)} />
      <TextInput label="Neighborhood" value={form.neighborhood ?? ""} onChange={(e) => f("neighborhood")(e.target.value)} />
      <Select label="Source" data={SOURCE_OPTIONS} value={form.source ?? "nextdoor"} onChange={f("source")} />
      <Select
        label="Role"
        data={[{ value: "pro", label: "Pro" }, { value: "homeowner", label: "Homeowner" }]}
        value={form.role ?? "pro"}
        onChange={f("role")}
      />
      <Textarea label="Notes" value={form.notes ?? ""} onChange={(e) => f("notes")(e.target.value)} minRows={3} />
      {error && <Alert color="red">{error}</Alert>}
      <Group justify="flex-end">
        <Button radius="xl" variant="default" onClick={onClose}>Cancel</Button>
        <Button
          radius="xl"
          onClick={handleSave}
          loading={saving}
          style={{ background: "var(--gk-accent-primary)", color: "#000" }}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={prospect ? `Edit — ${prospect.name}` : "Add Prospect"}
      position="right"
      size="calc(100vw - 240px)"
    >
      {prospect ? (
        formFields
      ) : (
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v ?? "paste")}
          styles={{
            tab: {
              "&[data-active]": {
                borderBottomColor: "var(--gk-accent-primary)",
                color: "var(--gk-accent-primary)",
              },
            },
          }}
        >
          <Tabs.List style={{ borderColor: "var(--gk-border)", marginBottom: 16 }}>
            <Tabs.Tab value="paste">Paste Text</Tabs.Tab>
            <Tabs.Tab value="form">Details</Tabs.Tab>
            <Tabs.Tab value="bulk" leftSection={<IconUpload size={12} />}>Bulk Upload</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="paste">
            <Stack>
              <Textarea
                placeholder={"Paste a Nextdoor post, WhatsApp message, email, or any text.\nName, phone, email, and ZIP will be extracted automatically."}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                autosize
                minRows={10}
                styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleParse}
                  disabled={!rawText.trim()}
                  style={{ background: "var(--gk-accent-primary)", color: "#000" }}
                >
                  Next →
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="form">
            {formFields}
          </Tabs.Panel>

          <Tabs.Panel value="bulk">
            <BulkUploadPanel onSaved={onSaved} onClose={onClose} />
          </Tabs.Panel>
        </Tabs>
      )}
    </Drawer>
  );
}

// ── Prospects Tab (merged Action Queue + All Prospects) ───────────────────────

function ProspectsTab() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [chatTarget, setChatTarget] = useState<Prospect | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [waTemplates, setWaTemplates] = useState<MessageTemplate[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<MessageTemplate[]>([]);
  const [stepFilters, setStepFilters] = useState<string[]>([]);
  const [channelFilters, setChannelFilters] = useState<string[]>([]);

  const { sorted, sortBy, sortDir, toggle } = useSort(prospects, "created_at", "desc");

  const displayed = useMemo(() => {
    let result = sorted;
    if (!statusFilter) {
      result = result.filter((p) => p.status !== "abandoned");
    }
    if (stepFilters.length > 0) {
      result = result.filter((p) => stepFilters.includes(String(p.current_sequence_step)));
    }
    if (channelFilters.length > 0) {
      result = result.filter((p) =>
        channelFilters.some((ch) =>
          (p.journey ?? []).some((s) => s.channel === ch && s.sent_at),
        ),
      );
    }
    return result;
  }, [sorted, statusFilter, stepFilters, channelFilters]);

  const stepCounts = useMemo(() => ({
    "0": sorted.filter((p) => p.current_sequence_step === 0).length,
    "1": sorted.filter((p) => p.current_sequence_step === 1).length,
    "2": sorted.filter((p) => p.current_sequence_step === 2).length,
    "3": sorted.filter((p) => p.current_sequence_step === 3).length,
  }), [sorted]);

  const channelCounts = useMemo(() => ({
    whatsapp: sorted.filter((p) => (p.journey ?? []).some((s) => s.channel === "whatsapp" && s.sent_at)).length,
    email: sorted.filter((p) => (p.journey ?? []).some((s) => s.channel === "email" && s.sent_at)).length,
    sms: sorted.filter((p) => (p.journey ?? []).some((s) => s.channel === "sms" && s.sent_at)).length,
  }), [sorted]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prospects) counts[p.status] = (counts[p.status] ?? 0) + 1;
    return counts;
  }, [prospects]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prospects) counts[p.source] = (counts[p.source] ?? 0) + 1;
    return counts;
  }, [prospects]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listProspects({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
      setProspects(data);
    } catch {
      setError("Failed to load prospects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [debouncedSearch, statusFilter, sourceFilter]);

  useEffect(() => {
    listTemplates({ channel: "whatsapp" }).then(setWaTemplates).catch(() => {});
    listTemplates({ channel: "email" }).then(setEmailTemplates).catch(() => {});
  }, []);

  const handleSaved = (p: Prospect) => {
    setProspects((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      return idx >= 0 ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteProspect(id);
      setProspects((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const updated = await updateProspect(id, { status });
      setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleStartSequence = async (p: Prospect) => {
    setActionLoading(p.id);
    try {
      const updated = await startProspectSequence(p.id);
      setProspects((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleSendStep = async (p: Prospect, step: number, channel: "email" | "whatsapp" | "sms", isResend = false) => {
    setActionLoading(p.id);
    try {
      const updated = await sendProspectStep(p.id, step, channel, isResend);
      setProspects((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      notifications.show({ color: "green", title: "Sent", message: `Step ${step} ${channel} sent to ${p.email || p.name}.` });
    } catch (err) {
      notifications.show({ color: "red", title: "Send failed", message: err instanceof Error ? err.message : "Unknown error." });
    } finally { setActionLoading(null); }
  };

  const openEdit = (p: Prospect) => { setEditing(p); openDrawer(); };
  const openAdd = () => { setEditing(null); openDrawer(); };

  const allSelected = displayed.length > 0 && displayed.every((p) => selectedIds.has(p.id));
  const someSelected = !allSelected && displayed.some((p) => selectedIds.has(p.id));

  const handleToggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const handleToggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(displayed.map((p) => p.id)));

  const handleBulkAdvance = async () => {
    setBulkLoading(true);
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map((id) => advanceProspectStep(id)));
    results.forEach((r, i) => {
      if (r.status === "fulfilled")
        setProspects((prev) => prev.map((p) => (p.id === ids[i] ? r.value : p)));
    });
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const chatNextStep = chatTarget
    ? (chatTarget.current_sequence_step === 0 ? 1 : Math.min(chatTarget.current_sequence_step + 1, 3))
    : 1;
  const chatWaTemplate = waTemplates.find(t => t.kind === `sequence_${chatNextStep}`);

  return (
    <>
      <ProspectDrawer opened={drawerOpened} onClose={closeDrawer} prospect={editing} onSaved={handleSaved} />
      {chatTarget && (
        <ChatStepModal
          prospect={chatTarget}
          opened
          templateBody={chatWaTemplate?.body}
          onClose={() => setChatTarget(null)}
          onSent={(updated) => {
            setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setChatTarget(null);
          }}
        />
      )}

      <Stack gap="sm">
        <Group>
          <TextInput
            placeholder="Search name, email or phone…"
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All statuses"
            data={STATUS_OPTIONS.map((o) => ({ ...o, label: `${o.label} · ${statusCounts[o.value] ?? 0}` }))}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={180}
          />
          <Select
            placeholder="All sources"
            data={SOURCE_OPTIONS.map((o) => ({ ...o, label: `${o.label} · ${sourceCounts[o.value] ?? 0}` }))}
            value={sourceFilter}
            onChange={setSourceFilter}
            clearable
            w={160}
          />
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={openAdd}
            radius="xl"
            style={{ background: "var(--gk-accent-primary)", color: "#000" }}
          >
            Add Prospect
          </Button>
        </Group>

        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>Journey</Text>
          <Chip.Group multiple value={stepFilters} onChange={setStepFilters}>
            <Group gap={6}>
              <Chip size="xs" value="0" radius="xl">Not Started · {stepCounts["0"]}</Chip>
              <Chip size="xs" value="1" radius="xl">Step 1 · {stepCounts["1"]}</Chip>
              <Chip size="xs" value="2" radius="xl">Step 2 · {stepCounts["2"]}</Chip>
              <Chip size="xs" value="3" radius="xl">Step 3 · {stepCounts["3"]}</Chip>
            </Group>
          </Chip.Group>
          <Text size="xs" c="dimmed" fw={500} ml="xs">Channel</Text>
          <Chip.Group multiple value={channelFilters} onChange={setChannelFilters}>
            <Group gap={6}>
              <Chip size="xs" value="whatsapp" radius="xl">WhatsApp · {channelCounts.whatsapp}</Chip>
              <Chip size="xs" value="email" radius="xl">Email · {channelCounts.email}</Chip>
              <Chip size="xs" value="sms" radius="xl">Text · {channelCounts.sms}</Chip>
            </Group>
          </Chip.Group>
        </Group>

        {error && <Alert color="red">{error}</Alert>}

        {selectedIds.size > 0 && (
          <Group
            p="xs"
            gap="sm"
            style={{
              background: "color-mix(in srgb, var(--mantine-color-teal-5) 10%, var(--gk-bg-surface))",
              border: "1px solid color-mix(in srgb, var(--mantine-color-teal-5) 30%, transparent)",
              borderRadius: 8,
            }}
          >
            <Text size="sm" fw={500}>{selectedIds.size} selected</Text>
            <Button
              size="xs"
              radius="xl"
              color="teal"
              leftSection={<IconBrandWhatsapp size={12} />}
              loading={bulkLoading}
              onClick={handleBulkAdvance}
            >
              Mark WhatsApp Sent
            </Button>
            <Button size="xs" radius="xl" variant="subtle" color="gray" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </Group>
        )}

        {loading ? (
          <Loader size="sm" />
        ) : displayed.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No prospects found.</Text>
        ) : (
          <TableBox>
            <Table highlightOnHover fz="xs" verticalSpacing={4}>
              <Table.Thead style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}>
                <Table.Tr>
                  <Table.Th style={{ width: 32 }}>
                    <Checkbox
                      size="xs"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleToggleAll}
                    />
                  </Table.Th>
                  <SortTh col="name" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={120}>Name</SortTh>
                  <Table.Th style={{ minWidth: 130 }}>Actions</Table.Th>
                  <Table.Th style={{ minWidth: 170 }}>Contact</Table.Th>
                  <SortTh col="primary_zip" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={55}>ZIP</SortTh>
                  <SortTh col="source" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={80}>Source</SortTh>
                  <SortTh col="status" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={100}>Status</SortTh>
                  <Table.Th style={{ minWidth: 90 }}>Journey</Table.Th>
                  <SortTh col="created_at" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={80}>Added</SortTh>
                  <SortTh col="last_contacted_at" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={95}>Last Contact</SortTh>
                  <Table.Th style={{ minWidth: 55 }}>Link</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayed.map((p) => {
                  const isActionLoading = actionLoading === p.id;
                  const isDeleting = deleting === p.id;
                  const ns = p.current_sequence_step === 0 ? 1 : Math.min(p.current_sequence_step + 1, 3);
                  const waTmpl = waTemplates.find(t => t.kind === `sequence_${ns}`);
                  const emailTmpl = emailTemplates.find(t => t.kind === `sequence_${ns}`);
                  const waMsg = waTmpl ? renderTemplate(waTmpl.body, p) : null;
                  const isActionable = ["prospect", "in_progress"].includes(p.status);
                  const days = daysSince(p.last_contacted_at);
                  const lastJourneyChannel = [...(p.journey ?? [])]
                    .filter(s => s.sent_at && (s.channel === "whatsapp" || s.channel === "sms"))
                    .sort((a, b) => (b.step ?? 0) - (a.step ?? 0))[0]?.channel ?? "whatsapp";

                  return (
                    <Table.Tr key={p.id}>
                      <Table.Td>
                        <Checkbox
                          size="xs"
                          checked={selectedIds.has(p.id)}
                          onChange={() => handleToggleSelect(p.id)}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text
                            size="xs"
                            fw={600}
                            component={Link}
                            to={`/gk-admin/prospects/${p.id}`}
                            style={{ color: "var(--gk-accent-primary)", textDecoration: "none" }}
                          >
                            {p.name}
                          </Text>
                          <Text c="dimmed" ff="monospace" style={{ fontSize: 10 }}>{p.prospect_id}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={3} wrap="nowrap">
                          {isActionable && p.status === "prospect" && p.email && (
                            <Tooltip label="Start email sequence">
                              <ActionIcon
                                size="xs"
                                variant="light"
                                style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 15%, transparent)", color: "var(--gk-accent-primary)" }}
                                loading={isActionLoading}
                                onClick={() => handleStartSequence(p)}
                              >
                                <IconPlayerPlay size={10} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {p.phone && (
                            <Tooltip label="Open WhatsApp">
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="teal"
                                component="a"
                                href={buildWaUrl(p.phone, waMsg)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconWorld size={10} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {isActionable && p.current_sequence_step < 3 && (
                            <Tooltip label={`Send chat step via ${lastJourneyChannel === "sms" ? "Text" : "WhatsApp"}`}>
                              <ActionIcon
                                color={lastJourneyChannel === "sms" ? "blue" : "teal"}
                                variant="light"
                                size="xs"
                                onClick={() => setChatTarget(p)}
                              >
                                {lastJourneyChannel === "sms"
                                  ? <IconMessage size={10} />
                                  : <IconBrandWhatsapp size={10} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {isActionable && (
                            <>
                              <Tooltip label="Mark Converted">
                                <ActionIcon color="green" variant="subtle" size="xs" loading={isActionLoading} onClick={() => updateStatus(p.id, "converted")}>
                                  <IconUserCheck size={10} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Put On Hold">
                                <ActionIcon color="orange" variant="subtle" size="xs" loading={isActionLoading} onClick={() => updateStatus(p.id, "on_hold")}>
                                  <IconClockHour4 size={10} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Abandon">
                                <ActionIcon color="gray" variant="subtle" size="xs" loading={isActionLoading} onClick={() => updateStatus(p.id, "abandoned")}>
                                  <IconTrash size={10} />
                                </ActionIcon>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip label="Edit">
                            <ActionIcon size="xs" variant="subtle" onClick={() => openEdit(p)}>
                              <IconEdit size={10} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <ActionIcon size="xs" variant="subtle" color="red" loading={isDeleting} onClick={() => handleDelete(p.id)}>
                              <IconTrash size={10} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ minWidth: 170 }}>
                        <Stack gap={2}>
                          {p.email && (
                            <Group gap={3} wrap="nowrap">
                              <Text size="xs" truncate style={{ maxWidth: 125 }}>{p.email}</Text>
                              <CopyButton value={p.email} timeout={1200}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? "Copied!" : "Copy email"} withArrow>
                                    <ActionIcon size="xs" variant="subtle" color={copied ? "green" : "gray"} onClick={copy}>
                                      <IconCopy size={10} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                              {emailTmpl && p.email && (
                                <Tooltip label={`Send email (step ${ns})`} withArrow>
                                  <ActionIcon size="xs" variant="subtle" color="blue" loading={isActionLoading} onClick={() => handleSendStep(p, ns, "email")}>
                                    <IconMail size={10} />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </Group>
                          )}
                          {p.phone && (
                            <Group gap={3} wrap="nowrap">
                              <Text size="xs" c="dimmed" truncate style={{ maxWidth: 125 }}>{p.phone}</Text>
                              <CopyButton value={p.phone} timeout={1200}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? "Copied!" : "Copy phone"} withArrow>
                                    <ActionIcon size="xs" variant="subtle" color={copied ? "green" : "gray"} onClick={copy}>
                                      <IconCopy size={10} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                              {waMsg && (
                                <CopyButton value={waMsg} timeout={1200}>
                                  {({ copied, copy }) => (
                                    <Tooltip label={copied ? "Copied!" : `Copy WhatsApp message (step ${ns})`} withArrow>
                                      <ActionIcon size="xs" variant="subtle" color={copied ? "green" : "teal"} onClick={copy}>
                                        <IconBrandWhatsapp size={10} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                </CopyButton>
                              )}
                            </Group>
                          )}
                          {!p.email && !p.phone && <Text size="xs" c="dimmed">—</Text>}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">{p.primary_zip || "—"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={SOURCE_COLORS[p.source] ?? "gray"} size="xs" variant="light">
                          {p.source}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[p.status]} size="xs">
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <JourneyBlocks
                          journey={p.journey ?? []}
                          currentStep={p.current_sequence_step}
                          onResend={(step, channel) => handleSendStep(p, step, channel, true)}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {p.last_contacted_at ? (
                          <Stack gap={0}>
                            <Text
                              size="xs"
                              c={days !== null && days >= 3 ? "orange" : undefined}
                              fw={days !== null && days >= 3 ? 600 : undefined}
                            >
                              {new Date(p.last_contacted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Text>
                            <Text style={{ fontSize: 10 }} c="dimmed">{days}d ago</Text>
                          </Stack>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {p.link_clicked_at ? (
                          <Tooltip label={`Clicked ${new Date(p.link_clicked_at).toLocaleDateString()}`}>
                            <Badge size="xs" variant="dot" style={{ color: "var(--gk-accent-primary)", borderColor: "var(--gk-accent-primary)" }}>
                              Clicked
                            </Badge>
                          </Tooltip>
                        ) : (
                          <CopyButton value={buildSignupUrl()} timeout={1500}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? "Copied!" : "Copy signup link"}>
                                <ActionIcon size="xs" variant="subtle" onClick={copy} color={copied ? "green" : "gray"}>
                                  <IconCopy size={11} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </TableBox>
        )}
      </Stack>
    </>
  );
}

// ── Templates Tab ─────────────────────────────────────────────────────────────

const TEMPLATE_STEP_KINDS = ["sequence_1", "sequence_2", "sequence_3"] as const;
const TEMPLATE_CHANNELS = ["email", "whatsapp"] as const;

function TemplatesTab() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await listTemplates();
      setTemplates(all.filter(t => (TEMPLATE_STEP_KINDS as readonly string[]).includes(t.kind)));
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const getTemplate = (channel: string, kind: string) =>
    templates.find(t => t.channel === channel && t.kind === kind) ?? null;

  const needsSeed = TEMPLATE_STEP_KINDS.some(k =>
    TEMPLATE_CHANNELS.some(ch => !getTemplate(ch, k))
  );

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      for (const t of DEFAULT_TEMPLATES) {
        if (!getTemplate(t.channel, t.kind)) {
          await createTemplate(t);
        }
      }
      await load();
    } catch {
      /* ignore */
    } finally {
      setSeeding(false);
    }
  };

  const openEdit = (t: MessageTemplate) => {
    setEditing(t);
    setEditForm({ name: t.name, subject: t.subject, body: t.body });
    setSaveError(null);
    openDrawer();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateTemplate(editing.id, editForm);
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      closeDrawer();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader size="sm" />;

  return (
    <>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={editing ? `Edit: ${editing.name}` : "Edit Template"}
        position="right"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Template Name"
            value={editForm.name}
            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
          />
          {editing?.channel === "email" && (
            <TextInput
              label="Subject"
              value={editForm.subject}
              onChange={e => setEditForm(p => ({ ...p, subject: e.target.value }))}
            />
          )}
          <Textarea
            label="Body"
            value={editForm.body}
            onChange={e => setEditForm(p => ({ ...p, body: e.target.value }))}
            autosize
            minRows={10}
            styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
          />
          <Box
            p="xs"
            style={{
              background: "color-mix(in srgb, var(--gk-accent-primary) 8%, transparent)",
              borderRadius: 8,
              border: "1px solid var(--gk-border)",
            }}
          >
            <Text size="xs" fw={600} mb={4}>Available Variables</Text>
            <Text size="xs" ff="monospace" c="dimmed">
              {"{{name}}  {{source}}  {{neighborhood}}  {{primaryZip}}  {{signup_link}}"}
            </Text>
          </Box>
          {saveError && <Alert color="red">{saveError}</Alert>}
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
            <Button
              onClick={handleSave}
              loading={saving}
              style={{ background: "var(--gk-accent-primary)", color: "#000" }}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Drawer>

      <Stack gap="lg">
        {needsSeed && (
          <Alert color="yellow" title="Default Templates Missing">
            <Stack gap="xs">
              <Text size="sm">Set up the 6 default outreach templates (email + WhatsApp for each of the 3 steps).</Text>
              <Button size="xs" onClick={seedDefaults} loading={seeding} w="fit-content">
                Seed Defaults
              </Button>
            </Stack>
          </Alert>
        )}

        <SimpleGrid cols={2} spacing="md">
          <Card
            withBorder
            radius="md"
            p="sm"
            style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}
          >
            <Group gap="xs">
              <IconMail size={16} />
              <Text fw={600} size="sm">Email</Text>
            </Group>
          </Card>
          <Card
            withBorder
            radius="md"
            p="sm"
            style={{ background: "color-mix(in srgb, var(--mantine-color-teal-5) 12%, var(--gk-bg-surface))" }}
          >
            <Group gap="xs">
              <IconBrandWhatsapp size={16} color="var(--mantine-color-teal-6)" />
              <Text fw={600} size="sm">WhatsApp / SMS</Text>
            </Group>
          </Card>
        </SimpleGrid>

        {TEMPLATE_STEP_KINDS.map((kind, idx) => (
          <Stack key={kind} gap="xs">
            <Group gap="xs">
              <Badge
                size="sm"
                variant="filled"
                style={{ background: "var(--gk-accent-primary)", color: "#000" }}
              >
                Step {idx + 1}
              </Badge>
              <Text size="sm" fw={600} c="dimmed">{TEMPLATE_STEP_LABELS[idx]}</Text>
            </Group>
            <SimpleGrid cols={2} spacing="md">
              {TEMPLATE_CHANNELS.map(channel => {
                const tmpl = getTemplate(channel, kind);
                return (
                  <Card
                    key={channel}
                    withBorder
                    radius="md"
                    p="md"
                    style={{ background: "var(--gk-bg-surface)" }}
                  >
                    {tmpl ? (
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text size="xs" fw={600} c="dimmed">{tmpl.name}</Text>
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="gray"
                            onClick={() => openEdit(tmpl)}
                            style={{ flexShrink: 0 }}
                          >
                            <IconEdit size={12} />
                          </ActionIcon>
                        </Group>
                        {channel === "email" && tmpl.subject && (
                          <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                            Subject: {tmpl.subject}
                          </Text>
                        )}
                        <Box
                          style={{
                            maxHeight: 130,
                            overflow: "hidden",
                            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                          }}
                        >
                          <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                            {tmpl.body}
                          </Text>
                        </Box>
                      </Stack>
                    ) : (
                      <Text size="xs" c="dimmed" ta="center" py="md">
                        No template set.
                      </Text>
                    )}
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export function GkAdminProspectsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "dashboard";

  return (
    <Stack gap="xl" p="md" style={{ background: "var(--gk-bg-canvas)", minHeight: "100%" }}>
      <Title order={3}>Prospect Outreach</Title>
      <Tabs
        defaultValue={initialTab}
        keepMounted={false}
        styles={{
          tab: {
            "&[data-active]": {
              borderBottomColor: "var(--gk-accent-primary)",
              color: "var(--gk-accent-primary)",
            },
          },
        }}
      >
        <Tabs.List style={{ borderColor: "var(--gk-border)" }}>
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={14} />}>Dashboard</Tabs.Tab>
          <Tabs.Tab value="prospects" leftSection={<IconUsers size={14} />}>Prospects</Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconFileText size={14} />}>Templates</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="prospects" pt="md"><ProspectsTab /></Tabs.Panel>
        <Tabs.Panel value="templates" pt="md"><TemplatesTab /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
