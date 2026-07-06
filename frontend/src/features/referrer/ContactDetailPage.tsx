import {
  ActionIcon, Badge, Box, Button, Card, Divider, Group,
  Loader, Stack, Text, Textarea, TextInput, Title,
} from "@mantine/core";
import {
  IconArrowLeft, IconChevronDown, IconChevronUp,
  IconMail, IconPencil, IconPhone, IconRefresh, IconTrash, IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  archiveCircleShare, archiveFriendInvite,
  deleteReferrerPro,
  getInviteContactTimeline, getInviteList, getReferrerPros,
  resendCircleShare, resendFriendInvite, resendProInvite,
  updateFriendInvite, updateProInvite,
} from "../../api/endpoints";
import type { InviteTimelineEventOut } from "./types";
import type { UnifiedInvite } from "./components/InviteTimeline";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; color: string }> = {
  sent:    { label: "Sent",         color: "var(--mantine-color-blue-5)"   },
  resent:  { label: "Resent",       color: "var(--mantine-color-teal-5)"   },
  opened:  { label: "Opened",       color: "var(--mantine-color-grape-5)"  },
  clicked: { label: "Link Clicked", color: "var(--mantine-color-indigo-5)" },
  joined:  { label: "Joined",       color: "var(--mantine-color-green-6)"  },
};

const SCENARIO_LABELS: Record<string, string> = { pro: "Pro", friend: "Friend", circle: "Circle" };
const SCENARIO_COLORS: Record<string, string>  = { pro: "blue", friend: "orange", circle: "grape" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function secondsSince(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 1000;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function statusMeta(contact: UnifiedInvite): { label: string; color: string; isTerminal: boolean } {
  if (contact.scenario === "pro") {
    if (contact.is_on_platform) return { label: "On Platform", color: "green",  isTerminal: true  };
    if (contact.status === "opened") return { label: "Opened",  color: "grape",  isTerminal: false };
    return { label: "Pending", color: "gray", isTerminal: false };
  }
  if (contact.scenario === "friend") {
    if (contact.status === "followed") return { label: "Following", color: "teal",  isTerminal: true  };
    if (contact.status === "opened")   return { label: "Opened",    color: "grape", isTerminal: false };
    return { label: "Pending", color: "gray", isTerminal: false };
  }
  if (contact.status === "clicked") return { label: "Clicked", color: "indigo", isTerminal: false };
  if (contact.status === "opened")  return { label: "Opened",  color: "grape",  isTerminal: false };
  return { label: "Sent", color: "gray", isTerminal: false };
}

// ── Timeline dot-line ────────────────────────────────────────────────────────

function DotCol({ color, isLast }: { color: string; isLast: boolean }) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0, paddingTop: 3 }}>
      <Box style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {!isLast && (
        <Box style={{ width: 2, flex: 1, minHeight: 28, background: "var(--mantine-color-default-border)", marginTop: 4 }} />
      )}
    </Box>
  );
}

function EventRow({ event, isLast }: { event: InviteTimelineEventOut; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const meta = EVENT_META[event.event_type] ?? { label: event.event_type, color: "var(--mantine-color-gray-5)" };
  const expandable = !!event.message_body;

  return (
    <Box style={{ display: "flex", alignItems: "flex-start" }}>
      <DotCol color={meta.color} isLast={isLast} />
      <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingLeft: 10 }}>
        <Box
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: expandable ? "pointer" : "default" }}
          onClick={() => expandable && setExpanded((v) => !v)}
        >
          <Text size="xs" c="dimmed" style={{ width: 145, flexShrink: 0 }}>{fmtDateTime(event.occurred_at)}</Text>
          <Text size="xs" fw={700} style={{ color: meta.color, width: 100, flexShrink: 0 }}>{meta.label}</Text>
          {expandable && (
            <ActionIcon size="xs" variant="transparent" color="gray" tabIndex={-1}>
              {expanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
            </ActionIcon>
          )}
        </Box>
        {expandable && expanded && (
          <Box
            mt={8} p={12}
            style={{ background: "var(--mantine-color-gray-0)", borderRadius: 8, border: "1px solid var(--mantine-color-default-border)" }}
          >
            <Text size="sm" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{event.message_body}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function ContactDetailPage() {
  const { slug, scenario, id } = useParams<{ slug: string; scenario: string; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const numId = Number(id);

  // Contact — from navigation state (fast) or fetched (fallback on refresh/direct URL)
  const [contact, setContact] = useState<UnifiedInvite | null>(
    (location.state as { contact?: UnifiedInvite } | null)?.contact ?? null,
  );
  const [loadingContact, setLoadingContact] = useState(!contact);

  // Timeline events
  const [events, setEvents] = useState<InviteTimelineEventOut[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Resend panel
  const [resendOpen, setResendOpen] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  // Fallback load when navigating directly to URL
  useEffect(() => {
    if (contact) return;
    async function load() {
      setLoadingContact(true);
      try {
        if (scenario === "pro") {
          const pros = await getReferrerPros();
          const rp = pros.find((p) => p.id === numId);
          if (rp) {
            setContact({
              scenario: "pro", id: rp.id, invite_id: rp.invite_id,
              name: rp.name, trade: rp.trade, phone: rp.phone || "", email: rp.email || "",
              channel: "", status: rp.invite_status || "pending", click_count: 0,
              invited_at: rp.added_at, last_resent_at: rp.last_resent_at,
              is_on_platform: rp.is_on_platform, show_on_page: rp.show_on_page, endorsement: rp.endorsement,
            });
          }
        } else {
          const data = await getInviteList();
          const list = scenario === "friend" ? data.friend_invites : data.circle_invites;
          const found = list.find((i) => i.invite_id === numId);
          if (found) {
            setContact({
              scenario: scenario as "friend" | "circle",
              id: found.invite_id, invite_id: found.invite_id,
              name: found.name, trade: "", phone: found.phone, email: found.email,
              channel: found.channel, status: found.status, click_count: found.click_count,
              invited_at: found.invited_at, last_resent_at: found.last_resent_at,
            });
          }
        }
      } catch {
        // leave null — handled below
      } finally {
        setLoadingContact(false);
      }
    }
    void load();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Load timeline
  useEffect(() => {
    if (!contact?.invite_id) { setLoadingEvents(false); return; }
    setLoadingEvents(true);
    getInviteContactTimeline(contact.scenario, contact.invite_id)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [contact?.invite_id, contact?.scenario]);

  function goBack() {
    navigate(`/us/${slug}/home?tab=invite`);
  }

  function openEdit() {
    if (!contact) return;
    setDraft({ name: contact.name, phone: contact.phone, email: contact.email });
    setEditing(true);
  }

  async function handleSave() {
    if (!contact?.invite_id) return;
    setSaving(true);
    try {
      const patch = {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
      };
      if (contact.scenario === "pro") {
        await updateProInvite(contact.invite_id, patch);
      } else {
        await updateFriendInvite(contact.invite_id, patch);
      }
      setContact((c) => c ? { ...c, ...patch } : c);
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function openResend() {
    // Pre-fill with the most recent sent/resent message body
    const lastSent = [...events].find((e) => e.event_type === "sent" || e.event_type === "resent");
    setResendMsg(lastSent?.message_body ?? "");
    setResendOpen(true);
  }

  async function handleResend() {
    if (!contact?.invite_id) return;
    setResending(true);
    try {
      if (contact.scenario === "pro") await resendProInvite(contact.invite_id);
      else if (contact.scenario === "friend") await resendFriendInvite(contact.invite_id);
      else await resendCircleShare(contact.invite_id);

      const fresh = await getInviteContactTimeline(contact.scenario, contact.invite_id);
      setEvents(fresh);
      setContact((c) => c ? { ...c, last_resent_at: new Date().toISOString() } : c);
      setResendOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not resend.");
    } finally {
      setResending(false);
    }
  }

  async function handleRemove() {
    if (!contact) return;
    if (!confirm(`Remove ${contact.name}?`)) return;
    try {
      if (contact.scenario === "pro") await deleteReferrerPro(contact.id);
      else if (contact.scenario === "friend") await archiveFriendInvite(contact.invite_id!);
      else await archiveCircleShare(contact.invite_id!);
      goBack();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not remove.");
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  if (loadingContact) {
    return (
      <Stack align="center" pt="xl">
        <Loader size="sm" />
      </Stack>
    );
  }

  if (!contact) {
    return (
      <Stack p="md">
        <Button variant="subtle" size="xs" leftSection={<IconArrowLeft size={14} />} onClick={goBack}
          style={{ alignSelf: "flex-start" }}>
          Contacts
        </Button>
        <Text c="dimmed">Contact not found.</Text>
      </Stack>
    );
  }

  const sm = statusMeta(contact);
  const lastContactIso = contact.last_resent_at ?? contact.invited_at ?? null;
  const days = daysSince(lastContactIso);
  const sendCount = events.filter((e) => e.event_type === "sent" || e.event_type === "resent").length;
  const eligible24h = secondsSince(lastContactIso) > 86400;
  const canResend = contact.invite_id != null && !sm.isTerminal && eligible24h;

  return (
    <Stack gap="lg" p="md" style={{ maxWidth: 680 }}>

      {/* Back */}
      <Button variant="subtle" size="xs" leftSection={<IconArrowLeft size={14} />}
        onClick={goBack} style={{ alignSelf: "flex-start" }}>
        Contacts
      </Button>

      {/* ── Contact card ─────────────────────────────────────────────────── */}
      <Card withBorder radius="md" p="md">
        <Group justify="space-between" align="flex-start" mb="sm">
          <Group gap="xs" wrap="wrap">
            {!editing && <Text fw={700} size="lg">{contact.name}</Text>}
            <Badge size="sm" variant="light" color={SCENARIO_COLORS[contact.scenario]}>
              {SCENARIO_LABELS[contact.scenario]}
            </Badge>
            <Badge size="sm" variant="light" color={sm.color}>{sm.label}</Badge>
          </Group>
          <Group gap={4}>
            {!editing && !contact.is_on_platform && contact.invite_id != null && (
              <ActionIcon size="sm" variant="subtle" color="gray" onClick={openEdit} aria-label="Edit">
                <IconPencil size={14} />
              </ActionIcon>
            )}
            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => void handleRemove()} aria-label="Remove">
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>

        {editing ? (
          <Stack gap="xs">
            <TextInput label="Name" size="sm" value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <Group grow>
              <TextInput label="Email" size="sm" leftSection={<IconMail size={13} />}
                value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
              <TextInput label="Phone" size="sm" leftSection={<IconPhone size={13} />}
                value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </Group>
            <Group justify="flex-end" gap="xs" mt={4}>
              <Button size="xs" variant="default" leftSection={<IconX size={12} />}
                onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="xs" loading={saving} onClick={() => void handleSave()}>Save</Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap={6}>
            <Group gap="lg" wrap="wrap">
              {contact.email && (
                <Group gap={5}>
                  <IconMail size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="sm">{contact.email}</Text>
                </Group>
              )}
              {contact.phone && (
                <Group gap={5}>
                  <IconPhone size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="sm">•••• {contact.phone.slice(-4)}</Text>
                </Group>
              )}
              {contact.trade && (
                <Text size="sm" c="dimmed">{contact.trade}</Text>
              )}
            </Group>
            <Group gap="xl" mt={4}>
              <Text size="xs" c="dimmed">Added {fmtDate(contact.invited_at)}</Text>
              {lastContactIso && (
                <Text size="xs" c={days !== null && days >= 2 ? "orange" : "dimmed"} fw={days !== null && days >= 2 ? 600 : undefined}>
                  Last contact {fmtDate(lastContactIso)}{days !== null ? ` · ${days}d ago` : ""}
                </Text>
              )}
              {sendCount > 0 && (
                <Text size="xs" c="dimmed">Sent {sendCount}×</Text>
              )}
            </Group>
          </Stack>
        )}
      </Card>

      {/* ── Resend ───────────────────────────────────────────────────────── */}
      {contact.invite_id != null && !sm.isTerminal && (
        resendOpen ? (
          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>Resend invite</Text>
                <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setResendOpen(false)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
              <Textarea
                label="Message"
                description="Review or edit before sending"
                value={resendMsg}
                onChange={(e) => setResendMsg(e.target.value)}
                minRows={4}
                autosize
                size="sm"
              />
              <Text size="xs" c="dimmed">
                Channel: <strong>{contact.channel || "email"}</strong>
                {!eligible24h && " · 24h cooldown active"}
              </Text>
              <Group justify="flex-end">
                <Button size="xs" variant="default" onClick={() => setResendOpen(false)}>Cancel</Button>
                <Button
                  size="xs"
                  leftSection={<IconRefresh size={13} />}
                  loading={resending}
                  disabled={!canResend}
                  onClick={() => void handleResend()}
                >
                  Send
                </Button>
              </Group>
            </Stack>
          </Card>
        ) : (
          <Group>
            <Button
              size="xs"
              variant="default"
              leftSection={<IconRefresh size={13} />}
              disabled={!canResend}
              title={!eligible24h ? "Wait 24h between resends" : undefined}
              onClick={openResend}
            >
              Resend{!eligible24h ? " (24h limit)" : ""}
            </Button>
          </Group>
        )
      )}

      <Divider />

      {/* ── Activity timeline ─────────────────────────────────────────── */}
      <Stack gap="sm">
        <Title order={5}>Activity</Title>

        {contact.invite_id == null ? (
          <Text size="sm" c="dimmed">
            {contact.is_on_platform
              ? "Added directly to your page — no invite was sent."
              : "No activity recorded yet."}
          </Text>
        ) : loadingEvents ? (
          <Loader size="xs" />
        ) : events.length === 0 ? (
          <Text size="sm" c="dimmed">No activity yet.</Text>
        ) : (
          <Box>
            {events.map((e, i) => (
              <EventRow
                key={`${e.event_type}-${e.occurred_at}`}
                event={e}
                isLast={i === events.length - 1}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
