import {
  ActionIcon, Badge, Box, Card, Divider, Group,
  Loader, Stack, Text, TagsInput, TextInput, Title,
} from "@mantine/core";
import {
  IconArrowLeft, IconChevronDown, IconChevronUp,
  IconMail, IconPencil, IconPhone, IconTrash, IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import {
  archiveCircleShare, archiveFriendInvite,
  deleteReferrerPro,
  getInviteContactTimeline, getInviteList, getReferrerPros,
  resendCircleShare, resendFriendInvite, resendProInvite,
  updateFriendInvite, updateProInvite, updateReferrerPro,
} from "../../api/endpoints";
import type { InviteTimelineEventOut } from "./types";
import type { UnifiedInvite } from "./components/InviteTimeline";
import { EmailChannelIcon, htmlToPlainText, htmlToWhatsApp, nativeBtn, PhoneChannelIcons } from "./components/inviteShared";
import { formatDate as fmtDate, formatDateTime as fmtDateTime } from "../../utils/format";
import { decodeContactId } from "../../utils/contactId";
import { toCamelTag } from "../../utils/tags";

// ── Helpers ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  borderColor: "var(--gk-border)",
  boxShadow: "0 4px 14px -4px var(--gk-accent-secondary)",
};

const iconColor = { color: "var(--gk-accent-primary)" } satisfies React.CSSProperties;

const EVENT_META: Record<string, { label: string; color: string }> = {
  sent:    { label: "Sent",         color: "var(--mantine-color-blue-5)"   },
  resent:  { label: "Resent",       color: "var(--mantine-color-teal-5)"   },
  opened:  { label: "Opened",       color: "var(--mantine-color-grape-5)"  },
  clicked: { label: "Link Clicked", color: "var(--mantine-color-indigo-5)" },
  joined:  { label: "Joined",       color: "var(--mantine-color-green-6)"  },
};

const SCENARIO_LABELS: Record<string, string> = { pro: "Pro", friend: "Friend", circle: "Circle" };
const SCENARIO_COLORS: Record<string, string>  = { pro: "blue", friend: "orange", circle: "grape" };

// Fallback tag suggestions shown when this referrer hasn't tagged anyone yet.
const GENERIC_TAG_SUGGESTIONS = ["reliable", "licensed", "insured", "fastResponse", "affordable", "recommended"];
const TRADE_TAG_SUGGESTIONS: Record<string, string[]> = {
  plumber: ["emergency", "leakRepair", "waterHeater"],
  electrician: ["panelUpgrade", "wiring", "evCharger"],
  hvac: ["acRepair", "furnace", "ductCleaning"],
  carpenter: ["customBuild", "framing", "cabinetry"],
  painter: ["interior", "exterior", "drywall"],
  "general contractor": ["remodel", "permits", "projectManagement"],
};

function secondsSince(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 1000;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/** Wrap plain text (with newlines) into editor-ready HTML paragraphs. */
function textToHtml(text: string): string {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${block.split("\n").join("<br>")}</p>`)
    .join("");
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
  const numId = decodeContactId(id ?? "") ?? NaN;

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
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", tags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // Resend panel
  const [resendOpen, setResendOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const resendEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your message…" }),
    ],
    content: "",
  });

  // Fallback load when navigating directly to URL
  useEffect(() => {
    if (contact) return;
    async function load() {
      setLoadingContact(true);
      try {
        if (scenario === "pro") {
          const [pros, invites] = await Promise.all([getReferrerPros(), getInviteList()]);
          const rp = pros.find((p) => p.id === numId);
          if (rp) {
            const pc = rp.invite_id != null ? invites.pro_invites.find((i) => i.invite_id === rp.invite_id) : undefined;
            setContact({
              scenario: "pro", id: rp.id, invite_id: rp.invite_id,
              name: rp.name, trade: rp.trade, phone: rp.phone || "", email: rp.email || "",
              channel: pc?.channel ?? "", status: rp.invite_status || "pending", click_count: pc?.click_count ?? 0,
              email_count: pc?.email_count ?? 0, whatsapp_count: pc?.whatsapp_count ?? 0, sms_count: pc?.sms_count ?? 0,
              invited_at: rp.added_at, last_resent_at: rp.last_resent_at,
              is_on_platform: rp.is_on_platform, show_on_page: rp.show_on_page, endorsement: rp.endorsement, tags: rp.tags,
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
              email_count: found.email_count, whatsapp_count: found.whatsapp_count, sms_count: found.sms_count,
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

  // Tag suggestions — other tags this referrer has already used across their pros
  useEffect(() => {
    if (contact?.scenario !== "pro") return;
    getReferrerPros()
      .then((pros) => {
        const all = new Set<string>();
        for (const p of pros) for (const t of p.tags ?? []) all.add(toCamelTag(t));
        setTagSuggestions([...all].filter(Boolean).sort());
      })
      .catch(() => {});
  }, [contact?.scenario]);

  function goBack() {
    navigate(`/us/${slug}/home?tab=invite`);
  }

  async function refreshTimeline() {
    if (!contact?.invite_id) return;
    try {
      const fresh = await getInviteContactTimeline(contact.scenario, contact.invite_id);
      setEvents(fresh);
    } catch {
      // leave existing events
    }
  }

  function openEdit() {
    if (!contact) return;
    setDraft({ name: contact.name, phone: contact.phone, email: contact.email, tags: contact.tags ?? [] });
    setEditing(true);
  }

  async function handleSave() {
    if (!contact) return;
    setSaving(true);
    try {
      const canEditContactInfo = !contact.is_on_platform && contact.invite_id != null;
      if (canEditContactInfo && contact.invite_id != null) {
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
      }
      if (contact.scenario === "pro") {
        await updateReferrerPro(contact.id, { tags: draft.tags });
        setContact((c) => c ? { ...c, tags: draft.tags } : c);
      }
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function openResend() {
    // Pre-fill with the most recent sent/resent message body
    const lastSent = sortedEvents.find((e) => e.event_type === "sent" || e.event_type === "resent");
    resendEditor?.commands.setContent(textToHtml(lastSent?.message_body ?? ""));
    setResendOpen(true);
  }

  async function handleResend() {
    if (!contact?.invite_id || !resendEditor) return;
    setResending(true);
    try {
      const html = resendEditor.getHTML();
      const message = contact.channel === "whatsapp" ? htmlToWhatsApp(html) : htmlToPlainText(html);

      if (contact.scenario === "pro") await resendProInvite(contact.invite_id, message);
      else if (contact.scenario === "friend") await resendFriendInvite(contact.invite_id, message);
      else await resendCircleShare(contact.invite_id, message);

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
        <Group gap="xs" align="center">
          <ActionIcon size="lg" variant="subtle" onClick={goBack} aria-label="Back" style={iconColor}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Contact</Title>
        </Group>
        <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} mb="xs" />
        <Text c="dimmed">Contact not found.</Text>
      </Stack>
    );
  }

  const sm = statusMeta(contact);
  const lastContactIso = contact.last_resent_at ?? contact.invited_at ?? null;
  const days = daysSince(lastContactIso);
  const eligible24h = import.meta.env.DEV || secondsSince(lastContactIso) > 86400;
  const canResend = contact.invite_id != null && !sm.isTerminal && eligible24h;
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  // Contact info (name/phone/email) is only editable for pending, off-platform invites —
  // on-platform pros' info comes from their real account. Tags are page-curation and
  // editable for any pro row regardless of platform status.
  const canEditContactInfo = !contact.is_on_platform && contact.invite_id != null;
  const canEditTags = contact.scenario === "pro";
  const canEdit = canEditContactInfo || canEditTags;
  const tradeTagSuggestions = TRADE_TAG_SUGGESTIONS[contact.trade.toLowerCase()] ?? [];
  const tagData = [...new Set([...tagSuggestions, ...tradeTagSuggestions, ...GENERIC_TAG_SUGGESTIONS])];

  return (
    <Stack gap="lg" p="md" style={{ maxWidth: 680 }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Group gap="xs" align="center">
        <ActionIcon size="lg" variant="subtle" onClick={goBack} aria-label="Back" style={iconColor}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>Contact</Title>
      </Group>
      <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} mb="xs" />

      {/* ── Contact card ─────────────────────────────────────────────────── */}
      <Card withBorder radius="md" p="md" style={cardStyle}>
        <Group justify="space-between" align="flex-start" mb="sm">
          <Group gap="xs" wrap="wrap">
            {(!editing || !canEditContactInfo) && <Text fw={700} size="lg">{contact.name}</Text>}
            <Badge size="sm" variant="light" color={SCENARIO_COLORS[contact.scenario]}>
              {SCENARIO_LABELS[contact.scenario]}
            </Badge>
            <Badge size="sm" variant="light" color={sm.color}>{sm.label}</Badge>
          </Group>
          <Group gap={4}>
            {!editing && canEdit && (
              <ActionIcon size="sm" variant="subtle" onClick={openEdit} aria-label="Edit" style={iconColor}>
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
            {canEditContactInfo && (
              <>
                <TextInput label="Name" size="sm" value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                <Group grow>
                  <TextInput label="Email" size="sm" leftSection={<IconMail size={13} style={iconColor} />}
                    value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
                  <TextInput label="Phone" size="sm" leftSection={<IconPhone size={13} style={iconColor} />}
                    value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
                </Group>
              </>
            )}
            {canEditTags && (
              <TagsInput
                label="Tags"
                description="Pick a suggestion or type your own and hit enter"
                placeholder="#tag"
                size="sm"
                value={draft.tags}
                onChange={(tags) => setDraft((d) => ({ ...d, tags: [...new Set(tags.map(toCamelTag).filter(Boolean))] }))}
                data={tagData}
              />
            )}
            <Group justify="flex-end" gap="xs" mt={4}>
              <button style={nativeBtn({})} onClick={() => setEditing(false)}>Cancel</button>
              <button style={nativeBtn({ primary: true, disabled: saving })} disabled={saving} onClick={() => void handleSave()}>
                {saving ? "Saving…" : "Save"}
              </button>
            </Group>
          </Stack>
        ) : (
          <Stack gap={6}>
            <Group gap="lg" wrap="wrap">
              {contact.email && (
                <Group gap={5}>
                  <EmailChannelIcon
                    scenario={contact.scenario} inviteId={contact.invite_id} email={contact.email}
                    opened={contact.status === "opened"} count={contact.email_count}
                    onChanged={() => void refreshTimeline()}
                  />
                  <Text size="sm">{contact.email}</Text>
                </Group>
              )}
              {contact.phone && (
                <Group gap={5}>
                  <PhoneChannelIcons
                    scenario={contact.scenario} inviteId={contact.invite_id} phone={contact.phone}
                    smsCount={contact.sms_count} whatsappCount={contact.whatsapp_count}
                    onChanged={() => void refreshTimeline()}
                  />
                  <Text size="sm">•••• {contact.phone.slice(-4)}</Text>
                </Group>
              )}
              {contact.trade && (
                <Text size="sm" c="dimmed">{contact.trade}</Text>
              )}
            </Group>
            {!!contact.tags?.length && (
              <Group gap={6} wrap="wrap">
                {contact.tags.map((t) => (
                  <Badge
                    key={t}
                    size="sm"
                    variant="filled"
                    style={{
                      textTransform: "none",
                      backgroundColor: "var(--gk-accent-secondary)",
                      color: "var(--gk-accent-primary)",
                    }}
                  >
                    #{toCamelTag(t)}
                  </Badge>
                ))}
              </Group>
            )}
            <Group gap="xl" mt={4}>
              <Text size="xs" c="dimmed">Added {fmtDate(contact.invited_at)}</Text>
              {lastContactIso && (
                <Text size="xs" c={days !== null && days >= 2 ? "orange" : "dimmed"} fw={days !== null && days >= 2 ? 600 : undefined}>
                  Last contact {fmtDate(lastContactIso)}{days !== null ? ` · ${days}d ago` : ""}
                </Text>
              )}
            </Group>
          </Stack>
        )}
      </Card>

      {/* ── Resend ───────────────────────────────────────────────────────── */}
      {contact.invite_id != null && !sm.isTerminal && (
        resendOpen ? (
          <Card withBorder radius="md" p="md" style={cardStyle}>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>Resend invite</Text>
                <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setResendOpen(false)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
              <Stack gap={4}>
                <Text size="sm" fw={500}>Message</Text>
                <Text size="xs" c="dimmed">Review or edit before sending</Text>
                <RichTextEditor editor={resendEditor} style={{ minHeight: 140 }}>
                  <RichTextEditor.Toolbar>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.Italic />
                      <RichTextEditor.Underline />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.ClearFormatting />
                    </RichTextEditor.ControlsGroup>
                  </RichTextEditor.Toolbar>
                  <RichTextEditor.Content />
                </RichTextEditor>
              </Stack>
              <Text size="xs" c="dimmed">
                Channel: <strong>{contact.channel || "email"}</strong>
                {!eligible24h && " · 24h cooldown active"}
              </Text>
              <Group justify="flex-end">
                <button style={nativeBtn({ small: true })} onClick={() => setResendOpen(false)}>Cancel</button>
                <button
                  style={nativeBtn({ primary: true, small: true, disabled: !canResend || resending })}
                  disabled={!canResend || resending}
                  onClick={() => void handleResend()}
                >
                  {resending ? "Sending…" : "Send"}
                </button>
              </Group>
            </Stack>
          </Card>
        ) : (
          <Group>
            <button
              style={nativeBtn({ small: true, disabled: !canResend })}
              disabled={!canResend}
              title={!eligible24h ? "Wait 24h between resends" : undefined}
              onClick={openResend}
            >
              Resend{!eligible24h ? " (24h limit)" : ""}
            </button>
          </Group>
        )
      )}

      <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} />

      {/* ── Activity timeline ─────────────────────────────────────────── */}
      <Stack gap="sm">
        <Title order={5} style={{ color: "var(--gk-accent-primary)" }}>Activity</Title>

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
            {sortedEvents.map((e, i) => (
              <EventRow
                key={`${e.event_type}-${e.occurred_at}`}
                event={e}
                isLast={i === sortedEvents.length - 1}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
