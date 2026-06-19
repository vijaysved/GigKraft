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
  ApiError,
} from "../../api/endpoints";
import type {
  Prospect,
  ProspectAnalytics,
  ProspectIn,
  StepJourney,
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

function buildSignupUrl(p: Prospect): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${base}/api/prospects/track/${p.signup_link_token}`;
}

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
}: {
  prospect: Prospect;
  opened: boolean;
  onClose: () => void;
  onSent: (updated: Prospect) => void;
}) {
  const nextStep =
    prospect.current_sequence_step === 0 ? 1 : Math.min(prospect.current_sequence_step + 1, 3);
  const templateFn = CHAT_TEMPLATES[nextStep];
  const text = templateFn ? templateFn(prospect) : "";
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
                {copied ? "Copied!" : "Copy to Clipboard"}
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

  useEffect(() => { void load(); }, []);

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

  return (
    <>
      {chatTarget && (
        <ChatStepModal
          prospect={chatTarget}
          opened
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
                  return (
                    <Table.Tr key={p.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{p.name}</Text>
                          <Text size="xs" c="dimmed" ff="monospace">{p.prospect_id}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="xs">{p.email || "—"}</Text>
                          <Text size="xs" c="dimmed">{p.phone || "—"}</Text>
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
                        <Text size="sm" c={days !== null && days >= 3 ? "orange" : undefined} fw={days !== null && days >= 3 ? 600 : undefined}>
                          {days !== null ? `${days}d` : "—"}
                        </Text>
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
  const [form, setForm] = useState<Partial<ProspectIn>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
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

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("Name is required."); return; }
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

  return (
    <Drawer opened={opened} onClose={onClose} title={prospect ? `Edit — ${prospect.name}` : "Add Prospect"} position="right" size="md">
      <Stack>
        <TextInput label="Name" required value={form.name ?? ""} onChange={(e) => f("name")(e.target.value)} />
        <TextInput label="Email" value={form.email ?? ""} onChange={(e) => f("email")(e.target.value)} />
        <TextInput label="Phone" value={form.phone ?? ""} onChange={(e) => f("phone")(e.target.value)} />
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
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md"><DashboardTab /></Tabs.Panel>
        <Tabs.Panel value="queue" pt="md"><ActionQueueTab /></Tabs.Panel>
        <Tabs.Panel value="all" pt="md"><AllProspectsTab /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
