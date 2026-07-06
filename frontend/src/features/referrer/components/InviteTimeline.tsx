import {
  ActionIcon, Badge, Box, Button, Group, Loader, Modal, Stack,
  Switch, Table, Text, Textarea, TextInput, Tooltip,
} from "@mantine/core";
import {
  IconArchive, IconBrandWhatsapp, IconEye, IconMail, IconMailOpened,
  IconMessage, IconPencil, IconRefresh, IconSearch, IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  archiveCircleShare,
  archiveFriendInvite,
  deleteReferrerPro,
  getInviteList,
  getReferrerPros,
  resendCircleShare,
  resendFriendInvite,
  resendProInvite,
  updateReferrerPro,
} from "../../../api/endpoints";
import type { InviteScenario } from "../types";

export interface UnifiedInvite {
  scenario: InviteScenario;
  /** Stable unique row id — ReferrerPro.id for pro rows, the invite PK otherwise. */
  id: number;
  /** Underlying invite PK for resend/timeline — null for a directly-added on-platform pro. */
  invite_id: number | null;
  name: string;
  trade: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  click_count: number;
  invited_at: string;
  last_resent_at: string | null;
  // Pro-only page-curation fields (undefined for friend/circle rows):
  is_on_platform?: boolean;
  show_on_page?: boolean;
  endorsement?: string;
}

function maskPhone(phone: string) {
  if (!phone) return "—";
  return "•••• " + phone.slice(-4);
}

function fmtDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function canResend(item: UnifiedInvite) {
  const last = item.last_resent_at || item.invited_at;
  return (Date.now() - new Date(last).getTime()) / 1000 > 86400;
}

const TYPE_LABELS: Record<InviteScenario, string> = { pro: "Pro", friend: "Friend", circle: "Circle" };
const TYPE_COLORS: Record<InviteScenario, string> = { pro: "blue", friend: "orange", circle: "grape" };

function statusMeta(item: UnifiedInvite): { label: string; color: string; isTerminal: boolean } {
  if (item.scenario === "pro") {
    if (item.is_on_platform) return { label: "On Platform", color: "green", isTerminal: true };
    if (item.status === "opened") return { label: "Opened", color: "grape", isTerminal: false };
    return { label: "Pending", color: "gray", isTerminal: false };
  }
  if (item.scenario === "friend") {
    if (item.status === "followed") return { label: "Following", color: "teal", isTerminal: true };
    if (item.status === "opened") return { label: "Opened", color: "grape", isTerminal: false };
    return { label: "Pending", color: "gray", isTerminal: false };
  }
  if (item.status === "clicked") return { label: "Clicked", color: "indigo", isTerminal: false };
  if (item.status === "opened") return { label: "Opened", color: "grape", isTerminal: false };
  return { label: "Sent", color: "gray", isTerminal: false };
}

// ── Summary chips — single line ───────────────────────────────────────────────

interface ChipDef { value: string; text: string; count: number; group: "type" | "channel" | "status" }

function FilterChip({
  chip, isActive, onSelect,
}: { chip: ChipDef; isActive: boolean; onSelect: () => void }) {
  return (
    <Box
      component="button"
      onClick={onSelect}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        border: isActive
          ? "1.5px solid var(--mantine-color-blue-5)"
          : "1.5px solid var(--mantine-color-default-border)",
        background: isActive ? "var(--mantine-color-blue-0)" : "var(--mantine-color-default)",
        color: isActive ? "var(--mantine-color-blue-7)" : "var(--mantine-color-dimmed)",
        fontFamily: "inherit",
        transition: "all 0.1s ease",
      }}
    >
      {chip.text}
      <Text component="span" size="xs" fw={700}
        style={{ color: isActive ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-5)" }}>
        · {chip.count}
      </Text>
    </Box>
  );
}

// ── Name-column icons ─────────────────────────────────────────────────────────

function NameIcons({ channel, status }: { channel: string; status: string }) {
  const opened = status === "opened";
  return (
    <Group gap={3} wrap="nowrap">
      {channel === "whatsapp" && <IconBrandWhatsapp size={13} color="var(--mantine-color-teal-6)" />}
      {channel === "sms"      && <IconMessage size={13} color="var(--mantine-color-blue-5)" />}
      {channel === "email"    && (
        opened
          ? <IconMailOpened size={13} color="var(--mantine-color-grape-5)" />
          : <IconMail size={13} color="var(--mantine-color-yellow-6)" />
      )}
      {opened && <IconEye size={13} color="var(--mantine-color-grape-5)" />}
    </Group>
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────

interface RowProps {
  item: UnifiedInvite;
  onOpen: () => void;
  onResend: () => void;
  onArchive: () => void;
  onRemove: () => void;
  onToggleShow: () => void;
  onEditEndorsement: () => void;
  resending: boolean;
  archiving: boolean;
}

function InviteRow({ item, onOpen, onResend, onArchive, onRemove, onToggleShow, onEditEndorsement, resending, archiving }: RowProps) {
  const status = statusMeta(item);
  const eligible = !status.isTerminal && item.invite_id != null && canResend(item);
  const isCuratedPro = item.scenario === "pro" && item.is_on_platform;

  const lastIso = item.last_resent_at ?? item.invited_at;
  const days = daysSince(lastIso);

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Text component="a" onClick={onOpen} size="sm" fw={600} c="blue" style={{ cursor: "pointer" }}>
            {item.name}
          </Text>
          <NameIcons channel={item.channel} status={item.status} />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge size="xs" variant="light" color={TYPE_COLORS[item.scenario]}>{TYPE_LABELS[item.scenario]}</Badge>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c={item.email ? undefined : "dimmed"}>{item.email || maskPhone(item.phone)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c={item.trade ? undefined : "dimmed"}>{item.trade || "—"}</Text>
      </Table.Td>
      <Table.Td>
        <Badge size="xs" variant="light" color={status.color}>{status.label}</Badge>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">{fmtDate(item.invited_at)}</Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="xs">{fmtDate(lastIso)}</Text>
          {days !== null && (
            <Text size="xs" c={days >= 2 ? "orange" : "dimmed"} fw={days >= 2 ? 600 : undefined}>
              {days}d ago
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="nowrap">
          {isCuratedPro ? (
            <>
              <Tooltip label={item.show_on_page ? "Shown on your page" : "Hidden from your page"} withArrow>
                <Switch size="xs" checked={!!item.show_on_page} onChange={onToggleShow} />
              </Tooltip>
              <Tooltip label="Edit endorsement" withArrow>
                <ActionIcon size="sm" variant="subtle" color="blue" onClick={onEditEndorsement}>
                  <IconPencil size={13} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Remove from your page" withArrow>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={onRemove}>
                  <IconTrash size={13} />
                </ActionIcon>
              </Tooltip>
            </>
          ) : (
            <>
              {item.invite_id != null && (
                <Tooltip label={eligible ? "Resend" : status.isTerminal ? status.label : "Wait 24h"} withArrow>
                  <ActionIcon size="sm" variant="subtle" color="blue" disabled={!eligible} loading={resending} onClick={onResend}>
                    <IconRefresh size={13} />
                  </ActionIcon>
                </Tooltip>
              )}
              {item.scenario === "pro" ? (
                <Tooltip label="Remove from your page" withArrow>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={onRemove}>
                    <IconTrash size={13} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Tooltip label="Archive" withArrow>
                  <ActionIcon size="sm" variant="subtle" color="gray" loading={archiving} onClick={onArchive}>
                    <IconArchive size={13} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InviteTimeline({ refreshKey, lockType }: { refreshKey: number; lockType?: InviteScenario }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<UnifiedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, "loading" | "">>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [endorsementTarget, setEndorsementTarget] = useState<UnifiedInvite | null>(null);
  const [endorsementDraft, setEndorsementDraft] = useState("");
  const [savingEndorsement, setSavingEndorsement] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [inviteData, pros] = await Promise.all([getInviteList(), getReferrerPros()]);
      const merged: UnifiedInvite[] = [
        ...pros.map((p) => ({
          scenario: "pro" as const, id: p.id, invite_id: p.invite_id, name: p.name, trade: p.trade,
          phone: p.phone || "", email: p.email || "", channel: "", status: p.invite_status || "pending",
          click_count: 0, invited_at: p.added_at, last_resent_at: p.last_resent_at,
          is_on_platform: p.is_on_platform, show_on_page: p.show_on_page, endorsement: p.endorsement,
        })),
        ...inviteData.friend_invites.map((i) => ({
          scenario: "friend" as const, id: i.invite_id, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
        ...inviteData.circle_invites.map((i) => ({
          scenario: "circle" as const, id: i.invite_id, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
      ].sort((a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime());
      setItems(merged);
    } catch {
      // leave previous state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [refreshKey]);

  function openContact(item: UnifiedInvite) {
    navigate(`/us/${slug}/contacts/${item.scenario}/${item.id}`, { state: { contact: item } });
  }

  async function handleResend(item: UnifiedInvite) {
    if (item.invite_id == null) return;
    const key = `${item.scenario}-${item.id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      if (item.scenario === "pro") await resendProInvite(item.invite_id);
      else if (item.scenario === "friend") await resendFriendInvite(item.invite_id);
      else await resendCircleShare(item.invite_id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not resend.");
    } finally {
      setRowState((s) => ({ ...s, [key]: "" }));
    }
  }

  async function handleArchive(item: UnifiedInvite) {
    if (item.invite_id == null) return;
    const key = `arch-${item.scenario}-${item.id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      if (item.scenario === "friend") await archiveFriendInvite(item.invite_id);
      else if (item.scenario === "circle") await archiveCircleShare(item.invite_id);
      await load();
    } finally {
      setRowState((s) => ({ ...s, [key]: "" }));
    }
  }

  async function handleRemovePro(item: UnifiedInvite) {
    if (!confirm(`Remove ${item.name} from your page?`)) return;
    const key = `rm-${item.scenario}-${item.id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      await deleteReferrerPro(item.id);
      await load();
    } finally {
      setRowState((s) => ({ ...s, [key]: "" }));
    }
  }

  async function handleToggleShow(item: UnifiedInvite) {
    await updateReferrerPro(item.id, { show_on_page: !item.show_on_page });
    await load();
  }

  function openEndorsementEditor(item: UnifiedInvite) {
    setEndorsementTarget(item);
    setEndorsementDraft(item.endorsement || "");
  }

  async function saveEndorsement() {
    if (!endorsementTarget) return;
    setSavingEndorsement(true);
    try {
      await updateReferrerPro(endorsementTarget.id, { endorsement: endorsementDraft });
      setEndorsementTarget(null);
      await load();
    } finally {
      setSavingEndorsement(false);
    }
  }

  // ── Counts for summary chips ──────────────────────────────────────────────

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { pro: 0, friend: 0, circle: 0 };
    for (const i of items) c[i.scenario] = (c[i.scenario] ?? 0) + 1;
    return c;
  }, [items]);

  const channelCounts = useMemo(() => {
    const c: Record<string, number> = { whatsapp: 0, email: 0, sms: 0 };
    for (const i of items) {
      if (i.channel === "whatsapp") c.whatsapp++;
      else if (i.channel === "email") c.email++;
      else if (i.channel === "sms") c.sms++;
    }
    return c;
  }, [items]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, opened: 0, joined: 0 };
    for (const i of items) {
      const s = statusMeta(i).label.toLowerCase();
      if (s === "pending" || s === "sent") c.pending++;
      else if (s === "opened") c.opened++;
      else if (s === "following" || s === "on platform") c.joined++;
    }
    return c;
  }, [items]);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (lockType && i.scenario !== lockType) return false;
      if (typeFilter !== "all" && i.scenario !== typeFilter) return false;
      if (channelFilter !== "all" && i.channel !== channelFilter) return false;
      if (statusFilter !== "all") {
        const s = statusMeta(i).label.toLowerCase();
        if (statusFilter === "joined" && s !== "following" && s !== "on platform") return false;
        if (statusFilter === "pending" && s !== "pending" && s !== "sent") return false;
        if (statusFilter === "opened" && s !== "opened") return false;
      }
      if (q && !i.name.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !i.phone.includes(q)) return false;
      return true;
    });
  }, [items, search, typeFilter, channelFilter, statusFilter, lockType]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack gap="sm">

      {/* Single-line summary chips */}
      {!loading && items.length > 0 && (
        <Group
          gap={6}
          wrap="wrap"
          pb={6}
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          {/* Type group — hidden when lockType is set */}
          {!lockType && (
            <>
              {(["pro", "friend", "circle"] as const).map((v) => (
                <FilterChip
                  key={v}
                  chip={{ value: v, text: TYPE_LABELS[v], count: typeCounts[v] ?? 0, group: "type" }}
                  isActive={typeFilter === v}
                  onSelect={() => setTypeFilter(typeFilter === v ? "all" : v)}
                />
              ))}
              <Box style={{ width: 1, height: 20, background: "var(--mantine-color-default-border)", alignSelf: "center" }} />
            </>
          )}

          {/* Channel group */}
          {(["whatsapp", "email", "sms"] as const).map((v) => (
            <FilterChip
              key={v}
              chip={{ value: v, text: v === "whatsapp" ? "WhatsApp" : v === "email" ? "Email" : "SMS", count: channelCounts[v] ?? 0, group: "channel" }}
              isActive={channelFilter === v}
              onSelect={() => setChannelFilter(channelFilter === v ? "all" : v)}
            />
          ))}
          <Box style={{ width: 1, height: 20, background: "var(--mantine-color-default-border)", alignSelf: "center" }} />

          {/* Status group */}
          {(["pending", "opened", "joined"] as const).map((v) => (
            <FilterChip
              key={v}
              chip={{ value: v, text: v.charAt(0).toUpperCase() + v.slice(1), count: statusCounts[v] ?? 0, group: "status" }}
              isActive={statusFilter === v}
              onSelect={() => setStatusFilter(statusFilter === v ? "all" : v)}
            />
          ))}
        </Group>
      )}

      {/* Search */}
      <TextInput
        placeholder="Search name, email, or phone…"
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      {/* Table */}
      {loading ? (
        <Loader size="xs" />
      ) : items.length === 0 ? (
        <Text size="sm" c="dimmed" py="sm">
          No contacts yet. Use the buttons above to invite a pro, a friend, or share your circle.
        </Text>
      ) : filtered.length === 0 ? (
        <Text size="sm" c="dimmed" py="sm">No contacts match the current filters.</Text>
      ) : (
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="xs" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Trade</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Added</Table.Th>
                <Table.Th>Last Contact</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((item) => (
                <InviteRow
                  key={`${item.scenario}-${item.id}`}
                  item={item}
                  onOpen={() => openContact(item)}
                  onResend={() => handleResend(item)}
                  onArchive={() => handleArchive(item)}
                  onRemove={() => handleRemovePro(item)}
                  onToggleShow={() => handleToggleShow(item)}
                  onEditEndorsement={() => openEndorsementEditor(item)}
                  resending={rowState[`${item.scenario}-${item.id}`] === "loading"}
                  archiving={rowState[`arch-${item.scenario}-${item.id}`] === "loading"}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      <Modal opened={!!endorsementTarget} onClose={() => setEndorsementTarget(null)} title="Edit endorsement" size="sm" centered>
        <Stack gap="sm">
          <Textarea
            placeholder="Why do you recommend this pro?"
            value={endorsementDraft}
            onChange={(e) => setEndorsementDraft(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEndorsementTarget(null)}>Cancel</Button>
            <Button loading={savingEndorsement} onClick={() => void saveEndorsement()}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
