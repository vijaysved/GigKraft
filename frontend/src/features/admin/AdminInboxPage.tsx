import {
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconArchive,
  IconInbox,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type InboxLead,
  type InboxMessage,
  archiveLead,
  getLead,
  listLeadMessages,
  listLeads,
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
  open: "blue",
  accepted: "teal",
  completed: "green",
  archived: "gray",
};

// ── Thread list item ──────────────────────────────────────────────────────────
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
function MessageBubble({ msg }: { msg: InboxMessage }) {
  return (
    <Group align="flex-start" gap="sm" justify="flex-start">
      <Avatar size={28} radius="xl" color="gray">
        {msg.sender_name[0]?.toUpperCase() ?? "?"}
      </Avatar>
      <Stack gap={2} style={{ maxWidth: "70%" }}>
        <Group gap="xs">
          <Text size="xs" fw={600} style={{ color: "var(--gk-text-primary)" }}>{msg.sender_name}</Text>
          <Badge size="xs" color="gray" variant="light">{msg.sender_role}</Badge>
          <Text size="xs" style={{ color: "var(--gk-text-secondary)" }}>{relTime(msg.created_at)}</Text>
        </Group>
        <Box
          style={{
            background: "var(--gk-bg-surface)",
            border: "1px solid var(--gk-border)",
            borderRadius: "0 10px 10px 10px",
            padding: "8px 12px",
          }}
        >
          <Text size="sm" style={{ color: "var(--gk-text-primary)", whiteSpace: "pre-wrap" }}>
            {msg.body}
          </Text>
        </Box>
      </Stack>
    </Group>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminInboxPage() {
  const { user } = useAuth();
  const { leadId: leadIdParam } = useParams<{ leadId?: string }>();
  const navigate = useNavigate();

  const isGkAdmin = user?.role === "gk_admin";
  const basePath = isGkAdmin ? "/gk-admin/inbox" : "/admin/inbox";

  const [activeTab, setActiveTab] = useState<TabKey>("lead");
  const [leads, setLeads] = useState<InboxLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [activeLead, setActiveLead] = useState<InboxLead | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load thread list when tab changes
  useEffect(() => {
    setLeadsLoading(true);
    const params =
      activeTab === "sent"
        ? { sent: true }
        : { thread_type: activeTab };
    listLeads(params)
      .then(setLeads)
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  }, [activeTab]);

  // Open lead from URL param on first load
  useEffect(() => {
    const id = leadIdParam ? parseInt(leadIdParam, 10) : NaN;
    if (!isNaN(id)) {
      getLead(id).then(setActiveLead).catch(() => {});
    }
  }, [leadIdParam]);

  // Load + poll messages when active lead changes
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeLead) { setMessages([]); return; }
    setMessagesLoading(true);
    listLeadMessages(activeLead.id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMessagesLoading(false));

    pollRef.current = setInterval(() => {
      const lastId = messages[messages.length - 1]?.id ?? 0;
      listLeadMessages(activeLead.id, lastId).then((newer) => {
        if (newer.length) setMessages((prev) => [...prev, ...newer]);
      }).catch(() => {});
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeLead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <Box style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
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
            <GkEmptyState icon={IconInbox} message="No threads here." />
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
          {/* Thread header */}
          <Box
            px="md"
            py="sm"
            style={{
              borderBottom: "1px solid var(--gk-border)",
              background: "var(--gk-bg-surface)",
            }}
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
                {activeLead.status !== "archived" && (
                  <Tooltip label="Archive">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={handleArchive}
                    >
                      <IconArchive size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>
          </Box>

          {/* Messages */}
          <ScrollArea style={{ flex: 1, padding: "16px" }}>
            {messagesLoading ? (
              <Stack align="center" pt="xl"><Loader size="sm" /></Stack>
            ) : messages.length === 0 ? (
              <GkEmptyState icon={IconInbox} message="No messages in this thread yet." />
            ) : (
              <Stack gap="md" px="md" pt="md">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={bottomRef} />
              </Stack>
            )}
          </ScrollArea>

          {/* Read-only notice */}
          <Box
            px="md"
            py="sm"
            style={{
              borderTop: "1px solid var(--gk-border)",
              background: "var(--gk-bg-surface)",
            }}
          >
            <Text size="xs" ta="center" style={{ color: "var(--gk-text-secondary)" }}>
              Admin view — read only
            </Text>
          </Box>
        </Box>
      ) : (
        <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GkEmptyState icon={IconInbox} message="Select a thread to view the conversation." />
        </Box>
      )}
    </Box>
  );
}
