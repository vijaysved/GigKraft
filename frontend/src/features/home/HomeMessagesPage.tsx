import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconArchive,
  IconCheck,
  IconLock,
  IconReceiptDollar,
  IconSend,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type InboxLead,
  type InboxMessage,
  type InboxQuote,
  acceptQuote,
  archiveLead,
  getLead,
  listLeadMessages,
  listLeads,
  sendLeadMessage,
} from "../../api/endpoints";
import { GkEmptyState } from "../../components/GkEmptyState";

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pro:       { label: "PRO",   color: "blue" },
    homeowner: { label: "HO",    color: "teal" },
    agent:     { label: "AGENT", color: "violet" },
  };
  const def = map[role] ?? { label: role.toUpperCase(), color: "gray" };
  return (
    <Badge size="xs" color={def.color} variant="filled" radius="sm" style={{ letterSpacing: "0.04em" }}>
      {def.label}
    </Badge>
  );
}

type TabKey = "lead" | "chat" | "request";
const TABS: { key: TabKey; label: string }[] = [
  { key: "lead",    label: "Leads / Quotes" },
  { key: "chat",    label: "Chats" },
  { key: "request", label: "Requests" },
];

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Rich Quote Card ───────────────────────────────────────────────────────────
function QuoteCard({
  quote,
  onAccept,
}: {
  quote: InboxQuote;
  onAccept?: (id: number) => void;
}) {
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    if (!onAccept) return;
    setAccepting(true);
    try {
      onAccept(quote.id);
    } finally {
      setAccepting(false);
    }
  }

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      style={{
        borderColor: quote.accepted ? "var(--mantine-color-green-5)" : "var(--gk-accent-primary)",
        background: "var(--gk-bg-surface)",
        maxWidth: 360,
      }}
    >
      <Stack gap="xs">
        <Group gap="xs">
          <IconReceiptDollar size={16} color="var(--gk-accent-primary)" />
          <Text size="sm" fw={700} style={{ color: "var(--gk-accent-primary)" }}>
            {quote.is_invoice ? "Invoice" : "Quote"}
          </Text>
          {quote.accepted && (
            <Badge size="xs" color="green" leftSection={<IconCheck size={10} />}>Accepted</Badge>
          )}
        </Group>
        <Divider style={{ borderColor: "var(--gk-border)" }} />
        <Stack gap={4}>
          {quote.line_items.map((li, i) => (
            <Group key={i} justify="space-between">
              <Text size="xs">{li.label}</Text>
              <Text size="xs" fw={600}>${li.amount.toLocaleString()}</Text>
            </Group>
          ))}
        </Stack>
        <Divider style={{ borderColor: "var(--gk-border)" }} />
        <Group justify="space-between">
          <Text size="sm" fw={700}>Total</Text>
          <Text size="sm" fw={700} style={{ color: "var(--gk-accent-secondary)" }}>
            ${quote.total.toLocaleString()}
          </Text>
        </Group>
        {!quote.accepted && !quote.is_invoice && onAccept && (
          <Button
            size="xs"
            color="green"
            fullWidth
            loading={accepting}
            onClick={() => void handleAccept()}
            leftSection={<IconCheck size={12} />}
          >
            Accept Quote
          </Button>
        )}
      </Stack>
    </Card>
  );
}

// ── Thread list row ───────────────────────────────────────────────────────────
function ThreadRow({
  lead,
  active,
  onClick,
}: {
  lead: InboxLead;
  active: boolean;
  onClick: () => void;
}) {
  const other = lead.pro;
  const isSingleLocked = lead.thread_type === "lead" && lead.status === "active";

  return (
    <Box
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        cursor: "pointer",
        background: active ? "color-mix(in srgb, var(--gk-accent-primary) 10%, transparent)" : "transparent",
        borderLeft: active ? "3px solid var(--gk-accent-primary)" : "3px solid transparent",
        transition: "background 0.12s",
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Avatar size={36} src={other?.avatar_url || undefined} radius="xl" color="blue">
          {!other?.avatar_url && (other?.name?.[0]?.toUpperCase() ?? "?")}
        </Avatar>
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={4} wrap="nowrap">
            <Text size="sm" fw={active ? 700 : 600} truncate style={{ maxWidth: 130 }}>
              {other?.name ?? "Pro"}
            </Text>
            {other && <RoleBadge role={other.role} />}
            {isSingleLocked && <IconLock size={11} color="var(--gk-text-muted)" />}
          </Group>
          <Text size="xs" fw={500} truncate style={{ color: "var(--gk-accent-primary)" }}>
            {lead.job_title}
          </Text>
          {lead.last_message && (
            <Text size="xs" c="dimmed" truncate>{lead.last_message}</Text>
          )}
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
          <Text size="xs" c="dimmed">{relTime(lead.created_at)}</Text>
          {lead.unread_hint > 0 && (
            <Badge size="xs" circle color="blue">{lead.unread_hint}</Badge>
          )}
        </Stack>
      </Group>
    </Box>
  );
}

// ── Chat pane (HO) ────────────────────────────────────────────────────────────
function ChatPane({
  lead,
  onUpdate,
}: {
  lead: InboxLead;
  onUpdate: (updated: InboxLead) => void;
}) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const lastIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const other = lead.pro;
  const isArchived = lead.status === "archived";
  const isWon = lead.status === "won";
  const isRequest = lead.thread_type === "request";

  // § Single-message lock: in a lead thread, HO cannot send after their first
  // message until the PRO responds (first_response_at is tracked server-side;
  // client infers by checking if any sent message exists and status is still active).
  const hasSentMessage = messages.some((m) => m.is_mine);
  const proHasResponded = messages.some((m) => !m.is_mine);
  const singleMessageLocked =
    lead.thread_type === "lead" &&
    lead.status === "active" &&
    hasSentMessage &&
    !proHasResponded;

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await listLeadMessages(lead.id, lastIdRef.current);
      if (msgs.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = msgs.filter((m) => !ids.has(m.id));
          if (!fresh.length) return prev;
          lastIdRef.current = Math.max(...fresh.map((m) => m.id), lastIdRef.current);
          return [...prev, ...fresh];
        });
      }
    } catch {
      // polling
    }
  }, [lead.id]);

  useEffect(() => {
    lastIdRef.current = 0;
    setMessages([]);
    void loadMessages();
    pollRef.current = setInterval(() => void loadMessages(), 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [lead.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendLeadMessage(lead.id, text);
      setMessages((p) => [...p, msg]);
      lastIdRef.current = Math.max(msg.id, lastIdRef.current);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  async function handleAcceptQuote(quoteId: number) {
    await acceptQuote(quoteId);
    const updated = await getLead(lead.id);
    onUpdate(updated);
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      const updated = await archiveLead(lead.id);
      onUpdate(updated);
    } finally {
      setArchiving(false);
    }
  }

  // Map quote-system messages to Rich Quote Cards
  const quoteByBody: Map<string, InboxQuote> = new Map();
  for (const q of lead.quotes) {
    const label = q.is_invoice ? "invoice" : "quote";
    const key = `[${label}] total $${q.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    quoteByBody.set(key, q);
  }

  const canChat = !isArchived && !isWon && !singleMessageLocked;

  return (
    <Stack h="100%" gap={0} style={{ minHeight: 0 }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Avatar size={40} src={other?.avatar_url || undefined} radius="xl" color="blue">
              {!other?.avatar_url && (other?.name?.[0]?.toUpperCase() ?? "P")}
            </Avatar>
            <Stack gap={2}>
              <Group gap={6}>
                <Text fw={700}>{other?.name ?? "Pro"}</Text>
                {other && <RoleBadge role={other.role} />}
                {(isWon || isArchived) && (
                  <Badge size="xs" color={isWon ? "green" : "gray"} variant="outline">
                    {isWon ? "Complete" : "Archived"}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                {lead.job_title}
              </Text>
            </Stack>
          </Group>
          {!isArchived && !isWon && (
            <ActionIcon size="sm" variant="light" color="gray" loading={archiving} onClick={() => void handleArchive()}>
              <IconArchive size={14} />
            </ActionIcon>
          )}
        </Group>
      </Box>

      {/* Single-message lock banner */}
      {singleMessageLocked && (
        <Alert
          variant="light"
          color="blue"
          icon={<IconLock size={15} />}
          style={{ borderRadius: 0, borderBottom: "1px solid var(--gk-border)" }}
          p="sm"
        >
          <Text size="xs">
            Your message was sent. You can send another once the pro responds — this keeps the conversation quality high for everyone.
          </Text>
        </Alert>
      )}

      {/* Message stream */}
      <ScrollArea style={{ flex: 1 }} p="md">
        <Stack gap="xs">
          {messages.map((msg) => {
            const quoteCard = quoteByBody.get(msg.body);
            if (quoteCard) {
              return (
                <Box key={msg.id} style={{ display: "flex", justifyContent: msg.is_mine ? "flex-end" : "flex-start" }}>
                  <QuoteCard
                    quote={quoteCard}
                    onAccept={!quoteCard.accepted && !quoteCard.is_invoice ? handleAcceptQuote : undefined}
                  />
                </Box>
              );
            }
            return (
              <Box
                key={msg.id}
                style={{ display: "flex", justifyContent: msg.is_mine ? "flex-end" : "flex-start" }}
              >
                <Box
                  p="sm"
                  style={{
                    borderRadius: 12,
                    maxWidth: "70%",
                    background: msg.is_mine ? "var(--gk-accent-primary)" : "var(--gk-bg-surface)",
                    color: msg.is_mine ? "#fff" : "inherit",
                    border: msg.is_mine ? "none" : "1px solid var(--gk-border)",
                  }}
                >
                  <Text size="sm">{msg.body}</Text>
                  <Group gap={4} mt={2}>
                    <Text size="xs" opacity={0.6}>{relTime(msg.created_at)}</Text>
                    {/* Receipt quarantine: suppress read receipts for request threads */}
                    {msg.is_mine && !isRequest && (
                      <IconCheck size={10} style={{ opacity: 0.6 }} />
                    )}
                  </Group>
                </Box>
              </Box>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      {error && (
        <Alert color="red" variant="light" p="sm" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {canChat ? (
        <Box p="sm" style={{ borderTop: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
          <Group gap="xs">
            <Textarea
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              size="sm"
            />
            <ActionIcon
              size="lg"
              style={{ background: "var(--gk-brand-gradient)" }}
              loading={sending}
              onClick={() => void send()}
              disabled={!draft.trim()}
            >
              <IconSend size={16} color="#fff" />
            </ActionIcon>
          </Group>
        </Box>
      ) : (
        <Box p="sm" style={{ borderTop: "1px solid var(--gk-border)", textAlign: "center" }}>
          <Text size="xs" c="dimmed">
            {singleMessageLocked
              ? "Waiting for the pro to reply…"
              : isArchived ? "This conversation is archived."
              : isWon ? "This job is complete."
              : ""}
          </Text>
        </Box>
      )}
    </Stack>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function HomeMessagesPage() {
  const { leadId } = useParams<{ leadId?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("lead");
  const [threads, setThreads] = useState<InboxLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(leadId ? Number(leadId) : null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await listLeads({ thread_type: activeTab });
        setThreads(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  function handleSelect(lead: InboxLead) {
    setSelectedId(lead.id);
    navigate(`/home/messages/${lead.id}`, { replace: true });
  }

  function handleUpdate(updated: InboxLead) {
    setThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  const tabCounts: Record<TabKey, number> = { lead: 0, chat: 0, request: 0 };
  for (const t of threads) {
    if (t.unread_hint > 0 && t.thread_type in tabCounts) {
      tabCounts[t.thread_type as TabKey]++;
    }
  }

  return (
    <Stack h="calc(100vh - 48px)" gap={0} style={{ minHeight: 0 }}>
      <Card
        withBorder
        radius="md"
        padding={0}
        style={{ flex: 1, display: "flex", flexDirection: "row", minHeight: 0, overflow: "hidden" }}
      >
        {/* Left pane */}
        <Box
          style={{
            width: 300,
            minWidth: 300,
            borderRight: "1px solid var(--gk-border)",
            display: "flex",
            flexDirection: "column",
            background: "var(--gk-bg-surface)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(v) => { if (v) { setActiveTab(v as TabKey); setSelectedId(null); } }}
            style={{ borderBottom: "1px solid var(--gk-border)" }}
          >
            <Tabs.List>
              {TABS.map(({ key, label }) => (
                <Tabs.Tab
                  key={key}
                  value={key}
                  style={{
                    fontSize: 11,
                    color: activeTab === key ? "var(--gk-accent-primary)" : "var(--gk-text-muted)",
                    fontWeight: activeTab === key ? 700 : 400,
                    padding: "8px 10px",
                  }}
                  rightSection={
                    tabCounts[key] > 0 ? (
                      <Badge size="xs" circle color="blue">{tabCounts[key]}</Badge>
                    ) : undefined
                  }
                >
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <ScrollArea style={{ flex: 1 }} p="xs">
            {loading ? (
              <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
            ) : threads.length === 0 ? (
              <GkEmptyState
                title={`No ${activeTab === "lead" ? "quote requests" : activeTab + "s"} yet`}
                description={
                  activeTab === "lead" ? "Your quote requests to pros appear here."
                  : activeTab === "chat" ? "Direct conversations appear here."
                  : "Messages from pros appear here."
                }
              />
            ) : (
              <Stack gap={2}>
                {threads.map((lead) => (
                  <ThreadRow
                    key={lead.id}
                    lead={lead}
                    active={selectedId === lead.id}
                    onClick={() => handleSelect(lead)}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>

        {/* Right pane */}
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {selected ? (
            <ChatPane lead={selected} onUpdate={handleUpdate} />
          ) : (
            <Stack align="center" justify="center" h="100%" gap="sm">
              <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Messages</Title>
              <Text size="sm" c="dimmed">Select a conversation to open it.</Text>
            </Stack>
          )}
        </Box>
      </Card>
    </Stack>
  );
}
