import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Drawer,
  Group,
  Loader,
  Modal,
  Progress,
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
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconFileText,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import {
  advanceProspectStep,
  createProspect,
  deleteProspect,
  getProspectAnalytics,
  listProspects,
  startProspectSequence,
  updateProspect,
  listTemplates,
  createTemplate,
  updateTemplate,
  ApiError,
} from "../../api/endpoints";
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
  in_progress: "yellow",
  converted: "green",
  on_hold: "orange",
  abandoned: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
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
    `Hi ${p.name}! Noticed your excellent work on ${p.source}. I'm Vijay, admin for *gigKraft.com*—a local trust network for pros in ${p.primary_zip}. We build sovereign digital portfolios for independent contractors. No lead fees or hidden cuts—just your own verified link to show clients. It's *$24.99/mo* or *$249.99/yr* flat.\n\nIf you'd like to reserve your profile link, check it out here: ${buildSignupUrl(p)}`,
  2: (p) =>
    `Hey ${p.name}, just following up! Local pros are loving *gigKraft.com* because they fully own their reviews and portfolio link, bypassing unpredictable platform algorithms. Great for dropping directly into your WhatsApp groups or Nextdoor replies.\n\nSet up your verified local profile in 2 mins: ${buildSignupUrl(p)}`,
  3: (p) =>
    `Hi ${p.name}, closing out your pending invite for now so I don't bug you. If you ever want to stand out to nearby homeowners with a clean profile for *$24.99/mo*, you can unlock it anytime here: ${buildSignupUrl(p)}. Wish you all the best!`,
};

function buildSignupUrl(_p: Prospect): string {
  return "https://www.gigkraft.com/for-pros";
}

function renderTemplate(body: string, p: Prospect): string {
  return body
    .replace(/\{\{name\}\}/g, p.name)
    .replace(/\{\{source\}\}/g, p.source)
    .replace(/\{\{neighborhood\}\}/g, p.neighborhood || p.primary_zip || "")
    .replace(/\{\{primaryZip\}\}/g, p.primary_zip || "")
    .replace(/\{\{signup_link\}\}/g, buildSignupUrl(p))
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
}: {
  journey: StepJourney[];
  currentStep: number;
}) {
  const steps = journey.length === 3 ? journey : [
    { step: 1, sent_at: null, channel: null, read_at: null },
    { step: 2, sent_at: null, channel: null, read_at: null },
    { step: 3, sent_at: null, channel: null, read_at: null },
  ];

  return (
    <Group gap={5} wrap="nowrap">
      {steps.map((s) => {
        const sent = !!s.sent_at;
        const opened = sent && s.channel === "email" && !!s.read_at;
        const emailSent = sent && s.channel === "email" && !s.read_at;
        const chatSent = sent && s.channel === "whatsapp";
        const isCurrent = s.step === currentStep && sent;

        let bg = "var(--mantine-color-default-border)";
        let iconColor = "var(--mantine-color-dimmed)";
        if (opened) {
          bg = "var(--gk-accent-primary)";
          iconColor = "#000";
        } else if (emailSent) {
          bg = "var(--mantine-color-yellow-5)";
          iconColor = "#000";
        } else if (chatSent) {
          bg = "var(--mantine-color-teal-5)";
          iconColor = "#fff";
        }

        const tooltip = opened
          ? `Step ${s.step}: Email opened ✓`
          : emailSent
          ? `Step ${s.step}: Email sent — not opened yet`
          : chatSent
          ? `Step ${s.step}: Chat message sent ✓`
          : `Step ${s.step}: Not started`;

        return (
          <Tooltip key={s.step} label={tooltip} withArrow>
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                outline: isCurrent ? "2px solid var(--gk-accent-primary)" : "none",
                outlineOffset: 2,
                transition: "background 0.2s",
              }}
            >
              {opened ? (
                <IconMailOpened size={13} color={iconColor} />
              ) : emailSent ? (
                <IconMail size={13} color={iconColor} />
              ) : chatSent ? (
                <IconBrandWhatsapp size={13} color={iconColor} />
              ) : (
                <Text size="xs" fw={700} style={{ color: iconColor, lineHeight: 1 }}>
                  {s.step}
                </Text>
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
        minWidth: minWidth ?? 80,
        background: active ? "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)" : undefined,
      }}
      onClick={() => onSort(col)}
    >
      <Group gap={4} wrap="nowrap">
        <span>{children}</span>
        {active ? (
          sortDir === "asc" ? (
            <IconChevronUp size={12} color="var(--gk-accent-primary)" />
          ) : (
            <IconChevronDown size={12} color="var(--gk-accent-primary)" />
          )
        ) : (
          <IconArrowsSort size={11} style={{ opacity: 0.3 }} />
        )}
      </Group>
    </Table.Th>
  );
}

function useSort<T>(data: T[], initial: keyof T | null = null) {
  const [sortBy, setSortBy] = useState<string | null>(initial as string | null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const statuses = Object.entries(analytics.by_status);
  const total = analytics.total || 1;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <KpiCard label="Total Prospects" value={analytics.total} accent />
        <KpiCard label="New (7 days)" value={analytics.new_7_days} />
        <KpiCard label="Conversion Rate" value={`${analytics.conversion_rate}%`} accent />
        <KpiCard label="Link CTR" value={`${analytics.link_ctr}%`} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
          <Text fw={600} mb="md">Status Funnel</Text>
          <Stack gap="xs">
            {statuses.map(([s, count]) => (
              <div key={s}>
                <Group justify="space-between" mb={2}>
                  <Badge color={STATUS_COLORS[s]} size="xs" variant="dot">{STATUS_LABELS[s]}</Badge>
                  <Text size="sm" fw={500}>{count}</Text>
                </Group>
                <Progress
                  value={(count / total) * 100}
                  color={s === "converted" ? "var(--gk-accent-primary)" : STATUS_COLORS[s]}
                  size="sm"
                  radius="xl"
                />
              </div>
            ))}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
          <Text fw={600} mb="md">Source Breakdown</Text>
          <Stack gap="xs">
            {Object.entries(analytics.by_source).map(([src, count]) => (
              <div key={src}>
                <Group justify="space-between" mb={2}>
                  <Badge color={SOURCE_COLORS[src] ?? "gray"} size="xs" variant="light">
                    {src.charAt(0).toUpperCase() + src.slice(1)}
                  </Badge>
                  <Text size="sm" fw={500}>{count}</Text>
                </Group>
                <Progress value={(count / total) * 100} color={SOURCE_COLORS[src] ?? "gray"} size="sm" radius="xl" />
              </div>
            ))}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg" style={{ background: "var(--gk-bg-surface)" }}>
          <Text fw={600} mb="md">Active Sequence Steps</Text>
          <Stack gap="xs">
            {Object.entries(analytics.by_sequence_step).map(([step, count]) => (
              <Group key={step} justify="space-between">
                <Group gap={6}>
                  <Text size="sm" c="dimmed">Step {step}</Text>
                  <JourneyBlocks
                    journey={[
                      { step: 1, sent_at: Number(step) >= 1 ? "x" : null, channel: "email", read_at: null },
                      { step: 2, sent_at: Number(step) >= 2 ? "x" : null, channel: "email", read_at: null },
                      { step: 3, sent_at: Number(step) >= 3 ? "x" : null, channel: "email", read_at: null },
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
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      const updated = await advanceProspectStep(prospect.id);
      onSent(updated);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to confirm.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Chat Step ${nextStep} — ${prospect.name}`}
      size="lg"
    >
      <Stack>
        {prospect.phone && (
          <Group
            justify="space-between"
            align="center"
            p="sm"
            style={{
              background: "color-mix(in srgb, var(--mantine-color-teal-5) 10%, var(--gk-bg-surface))",
              borderRadius: 8,
              border: "1px solid color-mix(in srgb, var(--mantine-color-teal-5) 30%, transparent)",
            }}
          >
            <Group gap="xs">
              <IconBrandWhatsapp size={15} color="var(--mantine-color-teal-6)" />
              <Text size="sm" fw={600}>{prospect.phone}</Text>
            </Group>
            <CopyButton value={prospect.phone} timeout={2000}>
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  variant="light"
                  color={copied ? "green" : "teal"}
                  leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  onClick={copy}
                >
                  {copied ? "Copied!" : "Copy Number"}
                </Button>
              )}
            </CopyButton>
          </Group>
        )}
        <Text size="sm" c="dimmed">
          Copy this to WhatsApp or Nextdoor DM, then click <strong>Confirm Sent</strong>.
        </Text>
        <Textarea value={text} readOnly autosize minRows={6} styles={{ input: { fontFamily: "monospace" } }} />
        <Group>
          <CopyButton value={text} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                onClick={copy}
                style={copied ? {} : { background: "var(--gk-accent-primary)", color: "#000" }}
              >
                {copied ? "Copied!" : "Copy Message"}
              </Button>
            )}
          </CopyButton>
          <Button
            leftSection={<IconCheck size={14} />}
            onClick={handleConfirm}
            loading={confirming}
            color="green"
          >
            Confirm Sent
          </Button>
        </Group>
        {error && <Alert color="red">{error}</Alert>}
      </Stack>
    </Modal>
  );
}

// ── Action Queue Tab ──────────────────────────────────────────────────────────

function ActionQueueTab() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<Prospect | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [waTemplates, setWaTemplates] = useState<MessageTemplate[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<MessageTemplate[]>([]);

  const { sorted, sortBy, sortDir, toggle } = useSort(prospects, "name");

  const load = async () => {
    setLoading(true);
    try {
      const [inProg, newPros] = await Promise.all([
        listProspects({ status: "in_progress" }),
        listProspects({ status: "prospect" }),
      ]);
      setProspects([...inProg, ...newPros]);
    } catch {
      setError("Failed to load action queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    listTemplates({ channel: "whatsapp" }).then(setWaTemplates).catch(() => {});
    listTemplates({ channel: "email" }).then(setEmailTemplates).catch(() => {});
  }, []);

  const displayed = useMemo(() => {
    let rows = sorted;
    if (statusFilter) rows = rows.filter((p) => p.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }
    return rows;
  }, [sorted, statusFilter, debouncedSearch]);

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const updated = await updateProspect(id, { status });
      if (["on_hold", "abandoned", "converted"].includes(status)) {
        setProspects((prev) => prev.filter((p) => p.id !== updated.id));
      } else {
        setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
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

  if (loading) return <Loader size="sm" />;
  if (error) return <Alert color="red">{error}</Alert>;

  const chatNextStep = chatTarget
    ? (chatTarget.current_sequence_step === 0 ? 1 : Math.min(chatTarget.current_sequence_step + 1, 3))
    : 1;
  const chatWaTemplate = waTemplates.find(t => t.kind === `sequence_${chatNextStep}`);

  return (
    <>
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
        {/* Filter bar */}
        <Group>
          <TextInput
            placeholder="Search name or email…"
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All statuses"
            data={STATUS_OPTIONS.filter((o) => ["prospect", "in_progress"].includes(o.value))}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={160}
          />
        </Group>

        {displayed.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No active prospects in the queue.</Text>
        ) : (
          <TableBox>
            <Table highlightOnHover>
              <Table.Thead style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}>
                <Table.Tr>
                  <SortTh col="name" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={140}>Name</SortTh>
                  <Table.Th style={{ minWidth: 140 }}>Contact</Table.Th>
                  <SortTh col="source" sortBy={sortBy} sortDir={sortDir} onSort={toggle}>Source</SortTh>
                  <SortTh col="status" sortBy={sortBy} sortDir={sortDir} onSort={toggle}>Status</SortTh>
                  <Table.Th style={{ minWidth: 110 }}>Journey</Table.Th>
                  <SortTh col="last_contacted_at" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={90}>
                    Days Ago
                  </SortTh>
                  <Table.Th style={{ minWidth: 80 }}>Link</Table.Th>
                  <Table.Th style={{ minWidth: 160 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayed.map((p) => {
                  const days = daysSince(p.last_contacted_at);
                  const isLoading = actionLoading === p.id;
                  const ns = p.current_sequence_step === 0 ? 1 : Math.min(p.current_sequence_step + 1, 3);
                  const waTmpl = waTemplates.find(t => t.kind === `sequence_${ns}`);
                  const emailTmpl = emailTemplates.find(t => t.kind === `sequence_${ns}`);
                  const waMsg = waTmpl ? renderTemplate(waTmpl.body, p) : null;
                  const emailBody = emailTmpl ? renderTemplate(emailTmpl.body, p) : null;
                  return (
                    <Table.Tr key={p.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{p.name}</Text>
                          <Text size="xs" c="dimmed" ff="monospace">{p.prospect_id}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td style={{ minWidth: 190 }}>
                        <Stack gap={3}>
                          {p.email ? (
                            <Group gap={4} wrap="nowrap">
                              <Text size="xs" truncate style={{ maxWidth: 130 }}>{p.email}</Text>
                              <CopyButton value={p.email} timeout={1200}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? "Copied!" : "Copy email"} withArrow>
                                    <ActionIcon size="xs" variant="subtle" color={copied ? "green" : "gray"} onClick={copy}>
                                      <IconCopy size={10} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                              {emailBody && (
                                <CopyButton value={emailBody} timeout={1200}>
                                  {({ copied, copy }) => (
                                    <Tooltip label={copied ? "Copied!" : `Copy email body (step ${ns})`} withArrow>
                                      <ActionIcon size="xs" variant="subtle" color={copied ? "green" : "blue"} onClick={copy}>
                                        <IconMail size={10} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                </CopyButton>
                              )}
                            </Group>
                          ) : (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                          {p.phone ? (
                            <Group gap={4} wrap="nowrap">
                              <Text size="xs" c="dimmed" truncate style={{ maxWidth: 130 }}>{p.phone}</Text>
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
                          ) : (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={SOURCE_COLORS[p.source] ?? "gray"} size="xs" variant="light">
                          {p.source}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[p.status]} size="sm">
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <JourneyBlocks journey={p.journey ?? []} currentStep={p.current_sequence_step} />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" c={days !== null && days >= 3 ? "orange" : undefined} fw={days !== null && days >= 3 ? 600 : undefined}>
                            {days !== null ? `${days}d` : "—"}
                          </Text>
                          {p.last_contacted_at && (
                            <Text size="xs" c="dimmed">
                              {new Date(p.last_contacted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        {p.link_clicked_at ? (
                          <Tooltip label={`Clicked ${new Date(p.link_clicked_at).toLocaleDateString()}`}>
                            <Badge size="xs" variant="dot" style={{ color: "var(--gk-accent-primary)", borderColor: "var(--gk-accent-primary)" }}>
                              Clicked
                            </Badge>
                          </Tooltip>
                        ) : (
                          <CopyButton value={buildSignupUrl(p)} timeout={1500}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? "Copied!" : "Copy signup link"}>
                                <ActionIcon size="sm" variant="subtle" onClick={copy} color={copied ? "green" : "gray"}>
                                  <IconCopy size={12} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          {p.status === "prospect" && p.email && (
                            <Tooltip label="Start email sequence (step 1)">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 15%, transparent)", color: "var(--gk-accent-primary)" }}
                                loading={isLoading}
                                onClick={() => handleStartSequence(p)}
                              >
                                <IconPlayerPlay size={12} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {p.current_sequence_step < 3 && (
                            <Tooltip label="Send chat step">
                              <ActionIcon color="teal" variant="light" size="sm" onClick={() => setChatTarget(p)}>
                                <IconBrandWhatsapp size={12} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="Mark Converted">
                            <ActionIcon color="green" variant="subtle" size="sm" loading={isLoading} onClick={() => updateStatus(p.id, "converted")}>
                              <IconUserCheck size={12} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Put On Hold">
                            <ActionIcon color="orange" variant="subtle" size="sm" loading={isLoading} onClick={() => updateStatus(p.id, "on_hold")}>
                              <IconClockHour4 size={12} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Abandon">
                            <ActionIcon color="gray" variant="subtle" size="sm" loading={isLoading} onClick={() => updateStatus(p.id, "abandoned")}>
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
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

// ── Prospect Form Drawer ──────────────────────────────────────────────────────

function parseProspectText(text: string): Partial<ProspectIn> {
  const out: Partial<ProspectIn> = {};

  // Email
  const emailM = text.match(/[\w.+\-]+@[\w\-]+(?:\.[\w\-]+)+/);
  if (emailM) out.email = emailM[0].trim();

  // Phone — common US formats
  const phoneM = text.match(/(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneM) out.phone = phoneM[0].trim();

  // ZIP — 5-digit
  const zipM = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipM) out.primary_zip = zipM[1];

  // Name — try strategies in order
  // 1. Explicit label: "Name: ..." or "Contact: ..."
  const labelM = text.match(/(?:^|\n)(?:name|contact|from)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/im);
  if (labelM) { out.name = labelM[1].trim(); }

  // 2. "I'm X" / "I am X" / "My name is X"
  if (!out.name) {
    const introM = text.match(/(?:i'?m|i am|my name is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (introM) out.name = introM[1].trim();
  }

  // 3. A line that is exactly 2–3 title-case words (looks like a standalone name)
  if (!out.name) {
    for (const line of text.split(/\n/)) {
      const t = line.trim();
      if (/^[A-Z][a-z]{1,20}(?:\s[A-Z][a-z]{1,20}){1,2}$/.test(t)) {
        out.name = t;
        break;
      }
    }
  }

  // 4. First two consecutive title-case words anywhere
  if (!out.name) {
    const twoM = text.match(/\b([A-Z][a-z]{1,20}\s[A-Z][a-z]{1,20})\b/);
    if (twoM) out.name = twoM[1];
  }

  return out;
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
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button
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
      size="md"
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
        </Tabs>
      )}
    </Drawer>
  );
}

// ── All Prospects Tab ─────────────────────────────────────────────────────────

function AllProspectsTab() {
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

  const { sorted, sortBy, sortDir, toggle } = useSort(prospects, "name");

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

  const openEdit = (p: Prospect) => { setEditing(p); openDrawer(); };
  const openAdd = () => { setEditing(null); openDrawer(); };

  return (
    <>
      <ProspectDrawer opened={drawerOpened} onClose={closeDrawer} prospect={editing} onSaved={handleSaved} />

      <Stack gap="sm">
        <Group>
          <TextInput
            placeholder="Search name or email…"
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select placeholder="All statuses" data={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} clearable w={160} />
          <Select placeholder="All sources" data={SOURCE_OPTIONS} value={sourceFilter} onChange={setSourceFilter} clearable w={140} />
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={openAdd}
            style={{ background: "var(--gk-accent-primary)", color: "#000" }}
          >
            Add Prospect
          </Button>
        </Group>

        {error && <Alert color="red">{error}</Alert>}

        {loading ? (
          <Loader size="sm" />
        ) : sorted.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">No prospects found.</Text>
        ) : (
          <TableBox>
            <Table highlightOnHover>
              <Table.Thead style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 8%, var(--gk-bg-surface))" }}>
                <Table.Tr>
                  <Table.Th style={{ minWidth: 80 }}>ID</Table.Th>
                  <SortTh col="name" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={140}>Name</SortTh>
                  <Table.Th style={{ minWidth: 140 }}>Contact</Table.Th>
                  <SortTh col="primary_zip" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={70}>ZIP</SortTh>
                  <SortTh col="source" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={90}>Source</SortTh>
                  <SortTh col="status" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={110}>Status</SortTh>
                  <Table.Th style={{ minWidth: 120 }}>Journey</Table.Th>
                  <SortTh col="converted_user_id" sortBy={sortBy} sortDir={sortDir} onSort={toggle} minWidth={100}>
                    Converted
                  </SortTh>
                  <Table.Th style={{ minWidth: 80 }}>Link</Table.Th>
                  <Table.Th style={{ minWidth: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sorted.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <Text size="xs" c="dimmed" ff="monospace">{p.prospect_id}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>{p.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="xs">{p.email || "—"}</Text>
                        <Text size="xs" c="dimmed">{p.phone || "—"}</Text>
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
                      <Badge color={STATUS_COLORS[p.status]} size="sm">
                        {STATUS_LABELS[p.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <JourneyBlocks journey={p.journey ?? []} currentStep={p.current_sequence_step} />
                    </Table.Td>
                    <Table.Td>
                      {p.converted_user_id ? (
                        <Badge size="xs" variant="light" style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 15%, transparent)", color: "var(--gk-accent-primary)" }}>
                          User #{p.converted_user_id}
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <CopyButton value={buildSignupUrl(p)} timeout={1500}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied!" : "Copy signup link"}>
                              <ActionIcon size="sm" variant="subtle" color={copied ? "green" : "gray"} onClick={copy}>
                                <IconCopy size={12} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                        {p.link_clicked_at && (
                          <Tooltip label={`Clicked ${new Date(p.link_clicked_at).toLocaleDateString()}`}>
                            <Box w={8} h={8} style={{ borderRadius: "50%", background: "var(--gk-accent-primary)", flexShrink: 0 }} />
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon size="sm" variant="subtle" onClick={() => openEdit(p)}>
                          <IconEdit size={12} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" loading={deleting === p.id} onClick={() => handleDelete(p.id)}>
                          <IconTrash size={12} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
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
  return (
    <Stack gap="xl" p="md" style={{ background: "var(--gk-bg-canvas)", minHeight: "100%" }}>
      <Title order={3}>Prospect Outreach</Title>
      <Tabs
        defaultValue="dashboard"
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
          <Tabs.Tab value="queue" leftSection={<IconClockHour4 size={14} />}>Action Queue</Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconUsers size={14} />}>All Prospects</Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconFileText size={14} />}>Templates</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="queue" pt="md"><ActionQueueTab /></Tabs.Panel>
        <Tabs.Panel value="all" pt="md"><AllProspectsTab /></Tabs.Panel>
        <Tabs.Panel value="templates" pt="md"><TemplatesTab /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
