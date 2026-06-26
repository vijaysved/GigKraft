import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconInbox,
  IconSearch,
  IconSend,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type InboxLead,
  type InboxMessage,
  type InboxUserRow,
  archiveLead,
  getLead,
  getGkInboxOverview,
  getGkInboxUserLeads,
  listLeadMessages,
  listLeads,
  sendLeadMessage,
} from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { GkEmptyState } from "../../components/GkEmptyState";

type TabKey = "lead" | "chat" | "request" | "sent";

const TABS: { key: TabKey; label: string }[] = [
  { key: "lead",    label: "Leads / Quotes" },
  { key: "chat",    label: "Chats" },
  { key: "request", label: "Requests" },
  { key: "sent",    label: "Sent" },
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

const STATUS_COLOR: Record<string, string> = {
  open: "blue", accepted: "teal", completed: "green", archived: "gray",
};

const ROLE_COLOR: Record<string, string> = {
  pro: "blue", homeowner: "teal", referrer: "violet", gk_admin: "red", node_manager: "orange",
};

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
  const proName = lead.pro?.name ?? "Unassigned";
  const hoName = lead.homeowner.name || "Homeowner";
  return (
    <Box
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "10px 12px",
        borderRadius: 8,
        background: active ? "var(--gk-bg-sidebar-active)" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--gk-bg-surface)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Avatar size={36} radius="xl" src={lead.homeowner.avatar_url || null} color="teal">
          {hoName[0]?.toUpperCase() ?? "H"}
        </Avatar>
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="sm" fw={600} truncate style={{ color: active ? "#fff" : "var(--gk-text-primary)" }}>
              {lead.job_title}
            </Text>
            <Text size="xs" style={{ color: active ? "rgba(255,255,255,0.6)" : "var(--gk-text-secondary)", flexShrink: 0 }}>
              {relTime(lead.created_at)}
            </Text>
          </Group>
          <Text size="xs" truncate style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--gk-text-secondary)" }}>
            HO: {hoName} · Pro: {proName}
          </Text>
          {lead.last_message && (
            <Text size="xs" truncate style={{ color: active ? "rgba(255,255,255,0.55)" : "var(--gk-text-secondary)" }}>
              {lead.last_message}
            </Text>
          )}
          <Group gap="xs" mt={2}>
            <Badge size="xs" color={STATUS_COLOR[lead.status] ?? "gray"} variant="light">
              {lead.status}
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Box>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, isGkAdmin }: { msg: InboxMessage; isGkAdmin: boolean }) {
  const isMine = msg.is_mine && isGkAdmin;
  return (
    <Box style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
      {!isMine && (
        <Avatar size={28} radius="xl" color="gray" mr="xs">
          {msg.sender_name[0]?.toUpperCase() ?? "?"}
        </Avatar>
      )}
      <Stack gap={2} style={{ maxWidth: "70%" }}>
        {!isMine && (
          <Group gap="xs">
            <Text size="xs" fw={600} style={{ color: "var(--gk-text-primary)" }}>{msg.sender_name}</Text>
            <Badge size="xs" color={ROLE_COLOR[msg.sender_role] ?? "gray"} variant="light">{msg.sender_role}</Badge>
            <Text size="xs" style={{ color: "var(--gk-text-secondary)" }}>{relTime(msg.created_at)}</Text>
          </Group>
        )}
        <Box
          p="sm"
          style={{
            borderRadius: isMine ? "10px 0 10px 10px" : "0 10px 10px 10px",
            background: isMine ? "var(--gk-accent-primary)" : "var(--gk-bg-surface)",
            color: isMine ? "#fff" : "var(--gk-text-primary)",
            border: isMine ? "none" : "1px solid var(--gk-border)",
          }}
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{msg.body}</Text>
          {isMine && <Text size="xs" opacity={0.6} mt={2}>{relTime(msg.created_at)}</Text>}
        </Box>
      </Stack>
    </Box>
  );
}

// ── Platform View (gk_admin only) ────────────────────────────────────────────
function PlatformView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [users, setUsers] = useState<InboxUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InboxUserRow | null>(null);
  const [userLeads, setUserLeads] = useState<InboxLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [activeThread, setActiveThread] = useState<InboxLead | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getGkInboxOverview({ search: debouncedSearch })
      .then((res) => { setUsers(res.items); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  function openUser(u: InboxUserRow) {
    setSelectedUser(u);
    setActiveThread(null);
    setMessages([]);
    setLeadsLoading(true);
    getGkInboxUserLeads(u.id)
      .then(setUserLeads)
      .catch(() => setUserLeads([]))
      .finally(() => setLeadsLoading(false));
  }

  function openThread(lead: InboxLead) {
    setActiveThread(lead);
    setMessagesLoading(true);
    listLeadMessages(lead.id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (selectedUser) {
    return (
      <Box style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* User's thread list */}
        <Box style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--gk-border)", display: "flex", flexDirection: "column" }}>
          <Box px="md" py="sm" style={{ borderBottom: "1px solid var(--gk-border)" }}>
            <Button size="xs" variant="subtle" onClick={() => { setSelectedUser(null); setActiveThread(null); }} px={0}>
              ← Back
            </Button>
            <Text fw={600} size="sm" mt={4}>{selectedUser.name}</Text>
            <Badge size="xs" color={ROLE_COLOR[selectedUser.role] ?? "gray"} variant="light">{selectedUser.role}</Badge>
          </Box>
          <ScrollArea style={{ flex: 1 }} p="xs">
            {leadsLoading ? (
              <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
            ) : userLeads.length === 0 ? (
              <GkEmptyState icon={<IconInbox />} title="No conversations." />
            ) : (
              <Stack gap={4}>
                {userLeads.map((lead) => (
                  <ThreadRow
                    key={lead.id}
                    lead={lead}
                    active={activeThread?.id === lead.id}
                    onClick={() => openThread(lead)}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>

        {/* Thread messages (read-only) */}
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeThread ? (
            <>
              <Box px="md" py="sm" style={{ borderBottom: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
                <Group gap="xs">
                  <Text fw={700} size="sm">{activeThread.job_title}</Text>
                  <Badge size="xs" color={STATUS_COLOR[activeThread.status] ?? "gray"} variant="light">{activeThread.status}</Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  {activeThread.homeowner.name} → {activeThread.pro?.name ?? "No pro"}
                </Text>
              </Box>
              <ScrollArea style={{ flex: 1, padding: 16 }}>
                {messagesLoading ? (
                  <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
                ) : messages.length === 0 ? (
                  <GkEmptyState icon={<IconInbox />} title="No messages yet." />
                ) : (
                  <Stack gap="md" px="md" pt="md">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isGkAdmin={false} />
                    ))}
                    <div ref={bottomRef} />
                  </Stack>
                )}
              </ScrollArea>
              <Box px="md" py="sm" style={{ borderTop: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
                <Text size="xs" ta="center" c="dimmed">Platform View — read only</Text>
              </Box>
            </>
          ) : (
            <Stack align="center" justify="center" h="100%" gap="sm">
              <Text size="sm" c="dimmed">Select a conversation to view messages.</Text>
            </Stack>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box px="md" pt="md" pb="xs">
        <Title order={5} style={{ color: "var(--gk-text-primary)" }}>Platform View</Title>
        <Text size="xs" c="dimmed" mb="xs">All users with conversation activity ({total} total)</Text>
        <TextInput
          placeholder="Search by name or email…"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size="sm"
        />
      </Box>
      <Divider style={{ borderColor: "var(--gk-border)" }} />
      <ScrollArea style={{ flex: 1 }}>
        {loading ? (
          <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
        ) : users.length === 0 ? (
          <GkEmptyState icon={<IconInbox />} title="No results." />
        ) : (
          <Table striped highlightOnHover withTableBorder={false} fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Threads</Table.Th>
                <Table.Th>Messages</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr
                  key={u.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => openUser(u)}
                >
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="xs" fw={600}>{u.name}</Text>
                      {u.email && <Text size="xs" c="dimmed">{u.email}</Text>}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={ROLE_COLOR[u.role] ?? "gray"} variant="light">{u.role}</Badge>
                  </Table.Td>
                  <Table.Td>{u.lead_count}</Table.Td>
                  <Table.Td>{u.message_count}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </ScrollArea>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminInboxPage() {
  const { user } = useAuth();
  const { leadId: leadIdParam } = useParams<{ leadId?: string }>();
  const navigate = useNavigate();

  const isGkAdmin = user?.role === "gk_admin";
  const basePath = isGkAdmin ? "/gk-admin/inbox" : "/admin/inbox";

  // "my" = personal inbox, "platform" = oversight view (gk_admin only)
  const [view, setView] = useState<"my" | "platform">("my");

  const [activeTab, setActiveTab] = useState<TabKey>("lead");
  const [leads, setLeads] = useState<InboxLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [activeLead, setActiveLead] = useState<InboxLead | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastIdRef = useRef(0);

  const isArchived = activeLead?.status === "archived";

  // Load thread list
  useEffect(() => {
    if (view !== "my") return;
    setLeadsLoading(true);
    const params = activeTab === "sent" ? { sent: true } : { thread_type: activeTab };
    listLeads(params)
      .then(setLeads)
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  }, [activeTab, view]);

  // Open lead from URL on first load
  useEffect(() => {
    const id = leadIdParam ? parseInt(leadIdParam, 10) : NaN;
    if (!isNaN(id)) {
      getLead(id).then(setActiveLead).catch(() => {});
    }
  }, [leadIdParam]);

  // Load + poll messages
  const loadMessages = useCallback(async () => {
    if (!activeLead) return;
    try {
      const msgs = await listLeadMessages(activeLead.id, lastIdRef.current);
      if (msgs.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = msgs.filter((m) => !ids.has(m.id));
          if (!fresh.length) return prev;
          lastIdRef.current = Math.max(...fresh.map((m) => m.id), lastIdRef.current);
          return [...prev, ...fresh];
        });
      }
    } catch { /* polling — ignore */ }
  }, [activeLead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeLead) { setMessages([]); lastIdRef.current = 0; return; }
    setMessagesLoading(true);
    lastIdRef.current = 0;
    listLeadMessages(activeLead.id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMessagesLoading(false));

    pollRef.current = setInterval(() => void loadMessages(), 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeLead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function openLead(lead: InboxLead) {
    setActiveLead(lead);
    navigate(`${basePath}/${lead.id}`, { replace: true });
  }

  const handleArchive = useCallback(async () => {
    if (!activeLead) return;
    try {
      const updated = await archiveLead(activeLead.id);
      setActiveLead(updated);
      setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } catch { /* ignore */ }
  }, [activeLead]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending || !activeLead) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendLeadMessage(activeLead.id, text);
      setMessages((p) => [...p, msg]);
      lastIdRef.current = Math.max(msg.id, lastIdRef.current);
      setDraft("");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Box style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden", flexDirection: "column" }}>
      {/* Toggle for gk_admin */}
      {isGkAdmin && (
        <Box px="md" py="xs" style={{ borderBottom: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
          <SegmentedControl
            size="xs"
            value={view}
            onChange={(v) => setView(v as "my" | "platform")}
            data={[
              { label: "My Messages", value: "my" },
              { label: "Platform View", value: "platform" },
            ]}
          />
        </Box>
      )}

      {view === "platform" ? (
        <Box style={{ flex: 1, overflow: "hidden" }}>
          <PlatformView />
        </Box>
      ) : (
        <Box style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left: thread list */}
          <Box
            style={{
              width: 320,
              flexShrink: 0,
              borderRight: "1px solid var(--gk-border)",
              display: "flex",
              flexDirection: "column",
              background: "var(--gk-bg-canvas)",
            }}
          >
            <Box px="md" pt="md" pb="xs">
              <Title order={5} style={{ color: "var(--gk-text-primary)" }}>Inbox</Title>
              <Text size="xs" style={{ color: "var(--gk-text-secondary)" }}>
                {isGkAdmin ? "Platform-wide" : "Node overview"}
              </Text>
            </Box>
            <Tabs
              value={activeTab}
              onChange={(v) => setActiveTab(v as TabKey)}
              variant="pills"
              px="sm"
              pb="xs"
            >
              <Tabs.List grow>
                {TABS.map((t) => (
                  <Tabs.Tab key={t.key} value={t.key} fz="xs" py={4}>
                    {t.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
            <Divider style={{ borderColor: "var(--gk-border)" }} />
            <ScrollArea style={{ flex: 1 }} p="xs">
              {leadsLoading ? (
                <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
              ) : leads.length === 0 ? (
                <GkEmptyState icon={<IconInbox />} title="No threads here." />
              ) : (
                <Stack gap={4}>
                  {leads.map((lead) => (
                    <ThreadRow
                      key={lead.id}
                      lead={lead}
                      active={activeLead?.id === lead.id}
                      onClick={() => openLead(lead)}
                    />
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </Box>

          {/* Right: thread detail */}
          {activeLead ? (
            <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Box
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}
              >
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Group gap="xs" align="center">
                      <Text fw={700} size="sm" style={{ color: "var(--gk-text-primary)" }}>
                        {activeLead.job_title}
                      </Text>
                      <Badge size="xs" color={STATUS_COLOR[activeLead.status] ?? "gray"} variant="light">
                        {activeLead.status}
                      </Badge>
                      <Badge size="xs" color="violet" variant="outline">
                        {activeLead.thread_type}
                      </Badge>
                    </Group>
                    <Text size="xs" style={{ color: "var(--gk-text-secondary)" }}>
                      HO: {activeLead.homeowner.name || "Homeowner"}
                      {activeLead.pro ? ` · Pro: ${activeLead.pro.name}` : " · No pro assigned"}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    {!isArchived && (
                      <Tooltip label="Archive">
                        <ActionIcon variant="subtle" color="gray" onClick={() => void handleArchive()}>
                          <IconArchive size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Group>
              </Box>

              <ScrollArea style={{ flex: 1, padding: "16px" }}>
                {messagesLoading ? (
                  <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
                ) : messages.length === 0 ? (
                  <GkEmptyState icon={<IconInbox />} title="No messages in this thread yet." />
                ) : (
                  <Stack gap="md" px="md" pt="md">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isGkAdmin={isGkAdmin} />
                    ))}
                    <div ref={bottomRef} />
                  </Stack>
                )}
              </ScrollArea>

              {/* Compose area */}
              {sendError && (
                <Alert color="red" variant="light" p="sm" onClose={() => setSendError(null)} withCloseButton>
                  {sendError}
                </Alert>
              )}
              {!isArchived ? (
                <Box
                  px="md"
                  py="sm"
                  style={{ borderTop: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}
                >
                  <Group gap="xs">
                    <Textarea
                      placeholder="Type a message…"
                      value={draft}
                      onChange={(e) => setDraft(e.currentTarget.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
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
                      onClick={() => void handleSend()}
                      disabled={!draft.trim()}
                    >
                      <IconSend size={16} color="#fff" />
                    </ActionIcon>
                  </Group>
                </Box>
              ) : (
                <Box px="md" py="sm" style={{ borderTop: "1px solid var(--gk-border)", background: "var(--gk-bg-surface)" }}>
                  <Text size="xs" ta="center" c="dimmed">This conversation is archived.</Text>
                </Box>
              )}
            </Box>
          ) : (
            <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GkEmptyState icon={<IconInbox />} title="Select a thread to view the conversation." />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
