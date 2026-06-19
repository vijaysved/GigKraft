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
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconCheck,
  IconCircleCheck,
  IconEdit,
  IconFileInvoice,
  IconLock,
  IconPlus,
  IconReceiptDollar,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type InboxLead,
  type InboxMessage,
  type InboxQuote,
  type InboxQuoteLineItem,
  type ComposePayload,
  acceptRequest,
  archiveLead,
  completeLead,
  composeMessage,
  getLead,
  listLeadMessages,
  listLeads,
  sendLeadMessage,
  sendLeadQuote,
} from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
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

// ── Thread tab labels ─────────────────────────────────────────────────────────
type TabKey = "lead" | "chat" | "request" | "sent";
const TABS: { key: TabKey; label: string }[] = [
  { key: "lead",    label: "Leads / Quotes" },
  { key: "chat",    label: "Chats" },
  { key: "request", label: "Requests" },
  { key: "sent",    label: "Sent" },
];

// ── Relative time ─────────────────────────────────────────────────────────────
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Rich Quote Card (locked display) ─────────────────────────────────────────
function QuoteCard({ quote }: { quote: InboxQuote; onAccept?: (id: number) => void }) {
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
      </Stack>
    </Card>
  );
}

// ── Send Quote modal ──────────────────────────────────────────────────────────
function SendQuoteModal({
  opened,
  onClose,
  onSend,
  isInvoice,
}: {
  opened: boolean;
  onClose: () => void;
  onSend: (items: InboxQuoteLineItem[], isInvoice: boolean) => Promise<void>;
  isInvoice: boolean;
}) {
  const [items, setItems] = useState<{ label: string; amount: number }[]>([{ label: "", amount: 0 }]);
  const [sending, setSending] = useState(false);
  const total = items.reduce((s, i) => s + (i.amount || 0), 0);

  function updateItem(index: number, field: "label" | "amount", value: string | number) {
    setItems((prev) => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  }
  function addItem() { setItems((p) => [...p, { label: "", amount: 0 }]); }
  function removeItem(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }

  async function handleSend() {
    const valid = items.filter((it) => it.label.trim() && it.amount > 0);
    if (!valid.length) return;
    setSending(true);
    try {
      await onSend(valid, isInvoice);
      setItems([{ label: "", amount: 0 }]);
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isInvoice ? "Send Invoice" : "Send Quote"}
      size="md"
    >
      <Stack gap="sm">
        <Stack gap="xs">
          {items.map((item, i) => (
            <Group key={i} gap="xs" wrap="nowrap">
              <TextInput
                placeholder="Line item description"
                value={item.label}
                onChange={(e) => updateItem(i, "label", e.currentTarget.value)}
                style={{ flex: 2 }}
                size="sm"
              />
              <NumberInput
                placeholder="0"
                value={item.amount}
                onChange={(v) => updateItem(i, "amount", Number(v) || 0)}
                prefix="$"
                min={0}
                size="sm"
                style={{ flex: 1 }}
              />
              {items.length > 1 && (
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => removeItem(i)}>
                  <IconTrash size={13} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={addItem} w="fit-content">
          Add line
        </Button>
        <Divider />
        <Group justify="space-between">
          <Text size="sm" fw={700}>Total</Text>
          <Text size="sm" fw={700} style={{ color: "var(--gk-accent-secondary)" }}>${total.toLocaleString()}</Text>
        </Group>
        <Button
          fullWidth
          onClick={() => void handleSend()}
          loading={sending}
          disabled={!items.some((it) => it.label.trim() && it.amount > 0)}
          leftSection={isInvoice ? <IconFileInvoice size={15} /> : <IconReceiptDollar size={15} />}
        >
          {isInvoice ? "Send Invoice" : "Send Quote"}
        </Button>
      </Stack>
    </Modal>
  );
}

// ── Compose modal ─────────────────────────────────────────────────────────────
function ComposeModal({
  opened,
  onClose,
  onSent,
}: {
  opened: boolean;
  onClose: () => void;
  onSent: (lead: InboxLead) => void;
}) {
  const [handle, setHandle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function handleClose() {
    setHandle("");
    setBody("");
    setError(null);
    onClose();
  }

  async function handleSend() {
    const h = handle.trim().replace(/^@/, "");
    const b = body.trim();
    if (!h || !b) { setError("Both handle and message are required."); return; }
    setSending(true);
    setError(null);
    try {
      const payload: ComposePayload = { handle: h, body: b };
      const lead = await composeMessage(payload);
      handleClose();
      onSent(lead);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="New Message" size="md">
      <Stack gap="sm">
        <TextInput
          label="To"
          placeholder="@pro-handle"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
          size="sm"
        />
        <Textarea
          label="Message"
          placeholder="Type your message…"
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          autosize
          minRows={3}
          maxRows={8}
          size="sm"
        />
        {error && <Alert color="red" variant="light" p="xs"><Text size="xs">{error}</Text></Alert>}
        <Button
          fullWidth
          onClick={() => void handleSend()}
          loading={sending}
          disabled={!handle.trim() || !body.trim()}
          leftSection={<IconSend size={15} />}
        >
          Send Message
        </Button>
      </Stack>
    </Modal>
  );
}

// ── Thread list row ───────────────────────────────────────────────────────────
function ThreadRow({
  lead,
  active,
  onClick,
  currentUserId,
}: {
  lead: InboxLead;
  active: boolean;
  onClick: () => void;
  currentUserId: number;
}) {
  const other = lead.homeowner.id === currentUserId ? lead.pro : lead.homeowner;
  const isLocked =
    lead.thread_type === "request" && !lead.request_accepted && lead.homeowner.id !== currentUserId;

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
              {other?.name ?? "Unknown"}
            </Text>
            {other && <RoleBadge role={other.role} />}
            {isLocked && <IconLock size={11} color="var(--gk-text-muted)" />}
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

// ── Chat pane ─────────────────────────────────────────────────────────────────
function ChatPane({
  lead,
  onUpdate,
  currentUserId,
}: {
  lead: InboxLead;
  onUpdate: (updated: InboxLead) => void;
  currentUserId: number;
}) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const lastIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine other party regardless of which slot current user occupies
  const other = lead.homeowner.id === currentUserId ? lead.pro : lead.homeowner;
  const viewerIsPro = lead.pro !== null && lead.pro.id !== lead.homeowner.id && lead.homeowner.id !== currentUserId;

  const isRequest = lead.thread_type === "request";
  const isAccepted = lead.request_accepted;
  const isArchived = lead.status === "archived";
  const isWon = lead.status === "won";

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
      // polling — silently ignore transient errors
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

  async function handleSendQuote(items: InboxQuoteLineItem[], isInvoice: boolean) {
    await sendLeadQuote(lead.id, items, isInvoice);
    const updated = await getLead(lead.id);
    onUpdate(updated);
    await loadMessages();
  }

  async function handleAcceptRequest() {
    setAccepting(true);
    try {
      const updated = await acceptRequest(lead.id);
      onUpdate(updated);
    } finally {
      setAccepting(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const updated = await completeLead(lead.id);
      onUpdate(updated);
    } finally {
      setCompleting(false);
    }
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

  // Collect inline quotes to show as Rich Quote Cards in the stream
  const quoteByBody: Map<string, InboxQuote> = new Map();
  for (const q of lead.quotes) {
    const label = q.is_invoice ? "invoice" : "quote";
    const key = `[${label}] total $${q.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    quoteByBody.set(key, q);
  }

  const canChat = !isArchived && !isWon && (!isRequest || isAccepted);

  return (
    <Stack h="100%" gap={0} style={{ minHeight: 0 }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Avatar size={40} src={other?.avatar_url || undefined} radius="xl" color="blue">
              {!other?.avatar_url && (other?.name?.[0]?.toUpperCase() ?? "?")}
            </Avatar>
            <Stack gap={2}>
              <Group gap={6}>
                <Text fw={700}>{other?.name ?? "Unknown"}</Text>
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

          {/* PRO action bar (only when viewer is in pro slot) */}
          <Group gap="xs">
            {viewerIsPro && isRequest && !isAccepted && (
              <Button
                size="xs"
                color="blue"
                leftSection={<IconCheck size={13} />}
                loading={accepting}
                onClick={() => void handleAcceptRequest()}
              >
                Accept Request
              </Button>
            )}
            {viewerIsPro && canChat && lead.thread_type === "lead" && (
              <>
                <Tooltip label="Send Quote" withArrow>
                  <ActionIcon size="sm" variant="light" color="blue" onClick={() => setQuoteModalOpen(true)}>
                    <IconReceiptDollar size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Send Invoice" withArrow>
                  <ActionIcon size="sm" variant="light" color="orange" onClick={() => setInvoiceModalOpen(true)}>
                    <IconFileInvoice size={14} />
                  </ActionIcon>
                </Tooltip>
                {!isWon && (
                  <Tooltip label="Mark Complete" withArrow>
                    <ActionIcon size="sm" variant="light" color="green" loading={completing} onClick={() => void handleComplete()}>
                      <IconCircleCheck size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </>
            )}
            {!isArchived && !isWon && (
              <Tooltip label="Archive" withArrow>
                <ActionIcon size="sm" variant="light" color="gray" loading={archiving} onClick={() => void handleArchive()}>
                  <IconArchive size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Box>

      {/* Request quarantine banner */}
      {viewerIsPro && isRequest && !isAccepted && (
        <Alert
          variant="light"
          color="yellow"
          icon={<IconLock size={15} />}
          style={{ borderRadius: 0, borderBottom: "1px solid var(--gk-border)" }}
          p="sm"
        >
          <Text size="xs">
            This is an unsolicited request. Accept it to start the conversation — the sender will not see read receipts until you do.
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
                  <QuoteCard quote={quoteCard} />
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
                    {msg.is_mine && !(isRequest && !isAccepted) && (
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

      {/* Input area */}
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
            {viewerIsPro && isRequest && !isAccepted
              ? "Accept this request to start chatting."
              : isArchived ? "This conversation is archived."
              : isWon ? "This job is complete."
              : ""}
          </Text>
        </Box>
      )}

      <SendQuoteModal
        opened={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onSend={handleSendQuote}
        isInvoice={false}
      />
      <SendQuoteModal
        opened={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSend={handleSendQuote}
        isInvoice={true}
      />
    </Stack>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProInboxPage() {
  const { leadId } = useParams<{ leadId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? 0;

  const [activeTab, setActiveTab] = useState<TabKey>("lead");
  const [threads, setThreads] = useState<InboxLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(leadId ? Number(leadId) : null);
  const [, setMobileShowChat] = useState(Boolean(leadId));
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = activeTab === "sent"
          ? await listLeads({ sent: true })
          : await listLeads({ thread_type: activeTab });
        setThreads(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  function handleSelect(lead: InboxLead) {
    setSelectedId(lead.id);
    setMobileShowChat(true);
    navigate(`/pro/inbox/${lead.id}`, { replace: true });
  }

  function handleUpdate(updated: InboxLead) {
    setThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  function handleComposed(lead: InboxLead) {
    setActiveTab("sent");
    setThreads((prev) => [lead, ...prev.filter((t) => t.id !== lead.id)]);
    setSelectedId(lead.id);
    setMobileShowChat(true);
    navigate(`/pro/inbox/${lead.id}`, { replace: true });
  }

  const tabCounts: Record<TabKey, number> = { lead: 0, chat: 0, request: 0, sent: 0 };
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
        {/* Left pane — thread list */}
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
          {/* Header row with Compose button */}
          <Box
            px="sm"
            py="xs"
            style={{ borderBottom: "1px solid var(--gk-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Text size="xs" fw={600} c="dimmed" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Inbox
            </Text>
            <Tooltip label="Compose new message" withArrow>
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={() => setComposeOpen(true)}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(v) => { if (v) { setActiveTab(v as TabKey); setSelectedId(null); setMobileShowChat(false); } }}
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
                    padding: "8px 8px",
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

          {/* Thread list */}
          <ScrollArea style={{ flex: 1 }} p="xs">
            {loading ? (
              <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
            ) : threads.length === 0 ? (
              <GkEmptyState
                title={
                  activeTab === "lead" ? "No leads yet"
                  : activeTab === "chat" ? "No chats yet"
                  : activeTab === "request" ? "No requests yet"
                  : "Nothing sent yet"
                }
                description={
                  activeTab === "lead" ? "Quote requests from homeowners appear here."
                  : activeTab === "chat" ? "Direct conversations appear here."
                  : activeTab === "request" ? "Unsolicited messages from new contacts appear here."
                  : "Messages you compose via the pencil icon appear here."
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
                    currentUserId={currentUserId}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>

        {/* Right pane — chat */}
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {selected ? (
            <ChatPane lead={selected} onUpdate={handleUpdate} currentUserId={currentUserId} />
          ) : (
            <Stack align="center" justify="center" h="100%" gap="sm">
              <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Sovereign Inbox</Title>
              <Text size="sm" c="dimmed">Select a conversation to open it.</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconEdit size={13} />}
                onClick={() => setComposeOpen(true)}
              >
                Compose new message
              </Button>
            </Stack>
          )}
        </Box>
      </Card>

      <ComposeModal
        opened={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={handleComposed}
      />
    </Stack>
  );
}
