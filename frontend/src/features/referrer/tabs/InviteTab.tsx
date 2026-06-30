import {
  ActionIcon,
  Alert,
  Badge,
  CopyButton,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconPencil,
  IconRefresh,
  IconSend,
  IconShare,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  archiveFriendInvite,
  archiveProInvite,
  createFriendInvite,
  createProInvite,
  getInviteList,
  resendFriendInvite,
  resendProInvite,
  updateFriendInvite,
  updateProInvite,
} from "../../../api/endpoints";
import type { InviteListOut, InviteListProOut, InviteListFriendOut } from "../types";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function maskPhone(phone: string) {
  if (!phone) return "—";
  return "•••• " + phone.slice(-4);
}

function relativeTime(isoStr: string | null) {
  if (!isoStr) return "—";
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function canResend(invite: { last_resent_at: string | null; invited_at: string }) {
  const last = invite.last_resent_at || invite.invited_at;
  return (Date.now() - new Date(last).getTime()) / 1000 > 86400;
}

function buildWaLink(phone: string, body: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}

function buildSmsLink(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

// ─── Sleek button styles (matching codebase pattern) ─────────────────────────

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 20px",
  border: "none",
  borderRadius: 99,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "inherit",
  lineHeight: 1.5,
  transition: "opacity 0.15s ease, box-shadow 0.15s ease",
  whiteSpace: "nowrap" as const,
};

const primaryBtn: React.CSSProperties = {
  ...btnBase,
  background: "var(--gk-brand-gradient, linear-gradient(135deg,#C42200,#FF6B1A 55%,#84CC16))",
  color: "#fff",
  boxShadow: "0 3px 10px -2px var(--gk-accent-primary, #C42200), inset 0 1px 0 rgba(255,255,255,0.18)",
};

const outlineBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--gk-accent-primary, #C42200)",
  border: "1.5px solid var(--gk-accent-primary, #C42200)",
};

const ghostBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--gk-text-secondary, #666)",
  border: "1.5px solid var(--mantine-color-gray-3, #dee2e6)",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function InviteTab() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [invites, setInvites] = useState<InviteListOut>({ pro_invites: [], friend_invites: [] });
  const [loadingInvites, setLoadingInvites] = useState(true);

  // Modal open state
  const [proModalOpen, setProModalOpen] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Pro invite form
  const [proName, setProName] = useState("");
  const [proPhone, setProPhone] = useState("");
  const [proNote, setProNote] = useState("");
  const [proChannel, setProChannel] = useState<string>("whatsapp");
  const [proSubmitting, setProSubmitting] = useState(false);
  const [proError, setProError] = useState<string | null>(null);

  // Friend invite form
  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [friendChannel, setFriendChannel] = useState<string>("whatsapp");
  const [friendSubmitting, setFriendSubmitting] = useState(false);
  const [friendError, setFriendError] = useState<string | null>(null);

  // Per-row action state: `pro-{id}` or `friend-{id}` → "loading" | "done" | "error"
  const [rowState, setRowState] = useState<Record<string, string>>({});

  // Inline contact edit state
  const [editing, setEditing] = useState<{ type: "pro" | "friend"; id: number } | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", phone: "", email: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    setLoadingInvites(true);
    try {
      setInvites(await getInviteList());
    } catch {
      // leave empty state
    } finally {
      setLoadingInvites(false);
    }
  }

  // ── Pro invite submit ──────────────────────────────────────────────────────

  async function submitProInvite(e: React.FormEvent) {
    e.preventDefault();
    setProError(null);
    if (!proName.trim() || !proPhone.trim()) { setProError("Name and phone are required."); return; }
    setProSubmitting(true);
    try {
      const data = await createProInvite({ name: proName, phone: proPhone, note: proNote, channel: proChannel });
      openProDeepLink(proName, proPhone, proChannel, data.token, data.referrer_slug);
      setProName(""); setProPhone(""); setProNote("");
      setProModalOpen(false);
      await loadInvites();
    } catch (e) {
      setProError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setProSubmitting(false);
    }
  }

  function openProDeepLink(name: string, phone: string, channel: string, token: string, referrerSlug: string) {
    const url = `https://gigkraft.com/us/${referrerSlug}/refer?claim=${token}`;
    const body = `Hey ${name}, I added you to my trusted network on GigKraft. Tap to see your profile and claim it: ${url}`;
    window.open(channel === "whatsapp" ? buildWaLink(phone, body) : buildSmsLink(phone, body), "_blank");
  }

  // ── Friend invite submit ───────────────────────────────────────────────────

  async function submitFriendInvite(e: React.FormEvent) {
    e.preventDefault();
    setFriendError(null);
    if (!friendName.trim() || !friendPhone.trim()) { setFriendError("Name and phone are required."); return; }
    setFriendSubmitting(true);
    try {
      const data = await createFriendInvite({ name: friendName, phone: friendPhone, channel: friendChannel });
      const url = `https://gigkraft.com/us/${data.referrer_slug}/refer?inv=${data.token}`;
      const body = `Hey ${friendName}, check out my trusted local pros on GigKraft: ${url}`;
      window.open(friendChannel === "whatsapp" ? buildWaLink(friendPhone, body) : buildSmsLink(friendPhone, body), "_blank");
      setFriendName(""); setFriendPhone("");
      setFriendModalOpen(false);
      await loadInvites();
    } catch (e) {
      setFriendError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setFriendSubmitting(false);
    }
  }

  // ── Resend ─────────────────────────────────────────────────────────────────

  async function handleResendPro(inv: InviteListProOut) {
    const key = `pro-${inv.invite_id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      const data = await resendProInvite(inv.invite_id);
      openProDeepLink(inv.name, inv.phone, inv.channel, data.token, data.referrer_slug);
      setRowState((s) => ({ ...s, [key]: "done" }));
      await loadInvites();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not resend.");
      setRowState((s) => ({ ...s, [key]: "" }));
    }
  }

  async function handleResendFriend(inv: InviteListFriendOut) {
    const key = `friend-${inv.invite_id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      const data = await resendFriendInvite(inv.invite_id);
      const url = `https://gigkraft.com/us/${data.referrer_slug}/refer?inv=${data.token}`;
      const body = `Hey ${inv.name}, check out my trusted local pros on GigKraft: ${url}`;
      window.open(inv.channel === "whatsapp" ? buildWaLink(inv.phone, body) : buildSmsLink(inv.phone, body), "_blank");
      setRowState((s) => ({ ...s, [key]: "done" }));
      await loadInvites();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not resend.");
      setRowState((s) => ({ ...s, [key]: "" }));
    }
  }

  // ── Archive ────────────────────────────────────────────────────────────────

  async function archivePro(inv: InviteListProOut) {
    const key = `pro-arch-${inv.invite_id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    await archiveProInvite(inv.invite_id).catch(() => undefined);
    await loadInvites();
    setRowState((s) => ({ ...s, [key]: "" }));
  }

  async function archiveFriend(inv: InviteListFriendOut) {
    const key = `friend-arch-${inv.invite_id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    await archiveFriendInvite(inv.invite_id).catch(() => undefined);
    await loadInvites();
    setRowState((s) => ({ ...s, [key]: "" }));
  }

  // ── Inline contact edit ────────────────────────────────────────────────────

  function startEdit(type: "pro" | "friend", inv: { invite_id: number; name: string; phone: string; email: string }) {
    setEditing({ type, id: inv.invite_id });
    setEditDraft({ name: inv.name, phone: inv.phone, email: inv.email });
    setEditError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const name = editDraft.name.trim();
    const phone = editDraft.phone.trim();
    const email = editDraft.email.trim();
    if (!name) { setEditError("Name is required."); return; }
    if (!phone && !email) { setEditError("Phone or email is required."); return; }
    setEditSaving(true);
    setEditError(null);
    try {
      if (editing.type === "pro") {
        await updateProInvite(editing.id, { name, phone, email });
      } else {
        await updateFriendInvite(editing.id, { name, phone, email });
      }
      setEditing(null);
      await loadInvites();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Shared table helpers ───────────────────────────────────────────────────

  const pageUrl = `gigkraft.com/us/${slug}/refer`;
  const waShareBody = `Hey, check out my trusted local pros on GigKraft: https://${pageUrl}`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Stack gap="xl">

      {/* ── Three action buttons ──────────────────────────────────── */}
      <Group gap="sm" wrap="wrap">
        <button style={primaryBtn} onClick={() => setProModalOpen(true)}>
          <IconUserPlus size={15} />
          Invite a Pro
        </button>
        <button style={outlineBtn} onClick={() => setFriendModalOpen(true)}>
          <IconUsers size={15} />
          Invite a Friend
        </button>
        <button style={ghostBtn} onClick={() => setShareModalOpen(true)}>
          <IconShare size={15} />
          Share My Circle
        </button>
      </Group>

      {/* ── Pro invites list ─────────────────────────────────────── */}
      <Stack gap="xs">
        <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
          Pro Invites
        </Title>

        {loadingInvites ? (
          <Loader size="xs" />
        ) : invites.pro_invites.length === 0 ? (
          <Text size="sm" c="dimmed" py="sm">
            No pro invites yet. Click "Invite a Pro" to get started.
          </Text>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withTableBorder fz="sm" style={{ minWidth: 700 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Via</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Clicks</Table.Th>
                  <Table.Th>Sent</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invites.pro_invites.map((inv) => {
                  const joined = inv.status === "claimed";
                  const resendKey = `pro-${inv.invite_id}`;
                  const archKey = `pro-arch-${inv.invite_id}`;
                  const resending = rowState[resendKey] === "loading";
                  const archiving = rowState[archKey] === "loading";
                  const eligible = canResend(inv) && !joined;
                  const isEditingRow = editing?.type === "pro" && editing.id === inv.invite_id;
                  if (isEditingRow) {
                    return (
                      <Table.Tr key={inv.invite_id}>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Name" value={editDraft.name}
                            onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Phone" value={editDraft.phone}
                            onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Email" value={editDraft.email}
                            onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td style={{ textTransform: "capitalize" }}>{inv.channel || "—"}</Table.Td>
                        <Table.Td>
                          <Badge color={joined ? "green" : "gray"} variant="light" size="sm">
                            {joined ? "Joined" : "Pending"}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">{inv.click_count}</Table.Td>
                        <Table.Td c="dimmed">{relativeTime(inv.invited_at)}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Group gap={4} wrap="nowrap">
                              <Tooltip label="Save" withArrow>
                                <ActionIcon size="sm" variant="subtle" color="green" loading={editSaving} onClick={saveEdit}>
                                  <IconCheck size={13} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Cancel" withArrow>
                                <ActionIcon size="sm" variant="subtle" color="gray" disabled={editSaving} onClick={cancelEdit}>
                                  <IconX size={13} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                            {editError && <Text size="xs" c="red">{editError}</Text>}
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }
                  return (
                    <Table.Tr key={inv.invite_id}>
                      <Table.Td fw={500} onClick={() => startEdit("pro", inv)} style={{ cursor: "pointer" }}>
                        {inv.name}
                      </Table.Td>
                      <Table.Td c="dimmed" onClick={() => startEdit("pro", inv)} style={{ cursor: "pointer" }}>
                        {maskPhone(inv.phone)}
                      </Table.Td>
                      <Table.Td c="dimmed" onClick={() => startEdit("pro", inv)} style={{ cursor: "pointer" }}>
                        {inv.email || "—"}
                      </Table.Td>
                      <Table.Td style={{ textTransform: "capitalize" }}>{inv.channel || "—"}</Table.Td>
                      <Table.Td>
                        <Badge color={joined ? "green" : "gray"} variant="light" size="sm">
                          {joined ? "Joined" : "Pending"}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">{inv.click_count}</Table.Td>
                      <Table.Td c="dimmed">{relativeTime(inv.invited_at)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Edit" withArrow>
                            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => startEdit("pro", inv)}>
                              <IconPencil size={13} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={eligible ? "Resend" : joined ? "Joined" : "Wait 24h"} withArrow>
                            <ActionIcon
                              size="sm" variant="subtle" color="blue"
                              disabled={!eligible} loading={resending}
                              onClick={() => handleResendPro(inv)}
                            >
                              <IconRefresh size={13} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Archive" withArrow>
                            <ActionIcon
                              size="sm" variant="subtle" color="gray"
                              loading={archiving}
                              onClick={() => archivePro(inv)}
                            >
                              <IconArchive size={13} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        )}
      </Stack>

      <Divider />

      {/* ── Friend invites list ──────────────────────────────────── */}
      <Stack gap="xs">
        <Title order={5} style={{ color: "var(--gk-text-secondary, #555)" }}>
          Friend Invites
        </Title>

        {loadingInvites ? (
          <Loader size="xs" />
        ) : invites.friend_invites.length === 0 ? (
          <Text size="sm" c="dimmed" py="sm">
            No friend invites yet. Click "Invite a Friend" to get started.
          </Text>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover withTableBorder fz="sm" style={{ minWidth: 660 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Via</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Clicks</Table.Th>
                  <Table.Th>Sent</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invites.friend_invites.map((inv) => {
                  const following = inv.status === "followed";
                  const resendKey = `friend-${inv.invite_id}`;
                  const archKey = `friend-arch-${inv.invite_id}`;
                  const resending = rowState[resendKey] === "loading";
                  const archiving = rowState[archKey] === "loading";
                  const eligible = canResend(inv) && !following;
                  const isEditingRow = editing?.type === "friend" && editing.id === inv.invite_id;
                  if (isEditingRow) {
                    return (
                      <Table.Tr key={inv.invite_id}>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Name" value={editDraft.name}
                            onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Phone" value={editDraft.phone}
                            onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            size="xs" placeholder="Email" value={editDraft.email}
                            onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                          />
                        </Table.Td>
                        <Table.Td style={{ textTransform: "capitalize" }}>{inv.channel || "—"}</Table.Td>
                        <Table.Td>
                          <Badge color={following ? "teal" : "gray"} variant="light" size="sm">
                            {following ? "Following" : "Pending"}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">{inv.click_count}</Table.Td>
                        <Table.Td c="dimmed">{relativeTime(inv.invited_at)}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Group gap={4} wrap="nowrap">
                              <Tooltip label="Save" withArrow>
                                <ActionIcon size="sm" variant="subtle" color="green" loading={editSaving} onClick={saveEdit}>
                                  <IconCheck size={13} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Cancel" withArrow>
                                <ActionIcon size="sm" variant="subtle" color="gray" disabled={editSaving} onClick={cancelEdit}>
                                  <IconX size={13} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                            {editError && <Text size="xs" c="red">{editError}</Text>}
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }
                  return (
                    <Table.Tr key={inv.invite_id}>
                      <Table.Td fw={500} onClick={() => startEdit("friend", inv)} style={{ cursor: "pointer" }}>
                        {inv.name}
                      </Table.Td>
                      <Table.Td c="dimmed" onClick={() => startEdit("friend", inv)} style={{ cursor: "pointer" }}>
                        {maskPhone(inv.phone)}
                      </Table.Td>
                      <Table.Td c="dimmed" onClick={() => startEdit("friend", inv)} style={{ cursor: "pointer" }}>
                        {inv.email || "—"}
                      </Table.Td>
                      <Table.Td style={{ textTransform: "capitalize" }}>{inv.channel || "—"}</Table.Td>
                      <Table.Td>
                        <Badge color={following ? "teal" : "gray"} variant="light" size="sm">
                          {following ? "Following" : "Pending"}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">{inv.click_count}</Table.Td>
                      <Table.Td c="dimmed">{relativeTime(inv.invited_at)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Edit" withArrow>
                            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => startEdit("friend", inv)}>
                              <IconPencil size={13} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={eligible ? "Resend" : following ? "Following" : "Wait 24h"} withArrow>
                            <ActionIcon
                              size="sm" variant="subtle" color="blue"
                              disabled={!eligible} loading={resending}
                              onClick={() => handleResendFriend(inv)}
                            >
                              <IconRefresh size={13} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Archive" withArrow>
                            <ActionIcon
                              size="sm" variant="subtle" color="gray"
                              loading={archiving}
                              onClick={() => archiveFriend(inv)}
                            >
                              <IconArchive size={13} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        )}
      </Stack>

      {/* ═══════════════════════════════════════════════════════════
          Modals
      ═══════════════════════════════════════════════════════════ */}

      {/* ── Invite a Pro modal ───────────────────────────────────── */}
      <Modal
        opened={proModalOpen}
        onClose={() => { setProModalOpen(false); setProError(null); }}
        title={
          <Group gap="xs">
            <IconUserPlus size={16} color="var(--gk-accent-primary)" />
            <Text fw={700}>Invite a Pro</Text>
          </Group>
        }
        centered
        radius="md"
      >
        <form onSubmit={submitProInvite}>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Add someone to your trusted circle — they'll get a link to claim their free profile.
            </Text>
            {proError && <Alert color="red" variant="light">{proError}</Alert>}
            <TextInput
              label="Pro's name"
              placeholder="Percy Vasquez"
              value={proName}
              onChange={(e) => setProName(e.target.value)}
              required
            />
            <TextInput
              label="Phone number"
              placeholder="+1 555 000 0000"
              value={proPhone}
              onChange={(e) => setProPhone(e.target.value)}
              required
            />
            <Select
              label="Send via"
              data={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "sms", label: "SMS" },
              ]}
              value={proChannel}
              onChange={(v) => setProChannel(v ?? "whatsapp")}
            />
            <Textarea
              label="Personal note (optional)"
              placeholder="Percy has been our family's plumber for 10 years…"
              value={proNote}
              onChange={(e) => setProNote(e.target.value)}
              autosize
              minRows={2}
            />
            <button
              type="submit"
              disabled={proSubmitting}
              style={{
                ...primaryBtn,
                width: "100%",
                marginTop: 4,
                opacity: proSubmitting ? 0.7 : 1,
                cursor: proSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <IconSend size={14} />
              {proSubmitting ? "Sending…" : "Send Invite"}
            </button>
          </Stack>
        </form>
      </Modal>

      {/* ── Invite a Friend modal ────────────────────────────────── */}
      <Modal
        opened={friendModalOpen}
        onClose={() => { setFriendModalOpen(false); setFriendError(null); }}
        title={
          <Group gap="xs">
            <IconUsers size={16} color="var(--gk-accent-primary)" />
            <Text fw={700}>Invite a Friend</Text>
          </Group>
        }
        centered
        radius="md"
      >
        <form onSubmit={submitFriendInvite}>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Invite a neighbor or friend to follow your page so they can request referrals.
            </Text>
            {friendError && <Alert color="red" variant="light">{friendError}</Alert>}
            <TextInput
              label="Friend's name"
              placeholder="Uma Kapoor"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              required
            />
            <TextInput
              label="Phone number"
              placeholder="+1 555 000 0000"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              required
            />
            <Select
              label="Send via"
              data={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "sms", label: "SMS" },
              ]}
              value={friendChannel}
              onChange={(v) => setFriendChannel(v ?? "whatsapp")}
            />
            <button
              type="submit"
              disabled={friendSubmitting}
              style={{
                ...primaryBtn,
                width: "100%",
                marginTop: 4,
                opacity: friendSubmitting ? 0.7 : 1,
                cursor: friendSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <IconSend size={14} />
              {friendSubmitting ? "Sending…" : "Send Invite"}
            </button>
          </Stack>
        </form>
      </Modal>

      {/* ── Share My Circle modal ────────────────────────────────── */}
      <Modal
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={
          <Group gap="xs">
            <IconShare size={16} color="var(--gk-accent-primary)" />
            <Text fw={700}>Share My Circle</Text>
          </Group>
        }
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Share your page with anyone — no name or phone needed.
          </Text>

          <>
              {/* URL display + copy */}
              <Group gap="xs" wrap="nowrap">
                <Text
                  size="sm"
                  style={{
                    flex: 1,
                    background: "var(--mantine-color-gray-1)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {pageUrl}
                </Text>
                <CopyButton value={`https://${pageUrl}`} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied!" : "Copy link"} withArrow>
                      <ActionIcon
                        variant={copied ? "filled" : "light"}
                        color={copied ? "green" : "blue"}
                        size="lg"
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>

              {/* WhatsApp share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(waShareBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  type="button"
                  style={{
                    ...primaryBtn,
                    width: "100%",
                    background: "linear-gradient(135deg, #128C7E, #25D366)",
                    boxShadow: "0 3px 10px -2px #25D36680",
                  }}
                >
                  <IconBrandWhatsapp size={16} />
                  Share on WhatsApp
                </button>
              </a>
            </>
        </Stack>
      </Modal>

    </Stack>
  );
}
