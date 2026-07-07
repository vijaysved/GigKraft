import {
  ActionIcon, Badge, Box, Button, Group, Loader, Modal, Stack,
  Switch, Table, Text, Textarea, TextInput, Title, Tooltip,
} from "@mantine/core";
import {
  IconArchive, IconArrowsSort, IconChevronDown, IconChevronUp,
  IconPencil, IconRefresh, IconSearch, IconTrash,
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
import { EmailChannelIcon, PhoneChannelIcons } from "./inviteShared";

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
  email_count: number;
  whatsapp_count: number;
  sms_count: number;
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

function fmtDateTime(isoStr: string) {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const ellipsis: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

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
          ? "1.5px solid var(--gk-accent-secondary)"
          : "1.5px solid var(--mantine-color-default-border)",
        background: isActive ? "color-mix(in srgb, var(--gk-accent-secondary) 15%, transparent)" : "var(--mantine-color-default)",
        color: isActive ? "var(--gk-accent-secondary)" : "var(--mantine-color-dimmed)",
        fontFamily: "inherit",
        transition: "all 0.1s ease",
      }}
    >
      {chip.text}
      <Text component="span" size="xs" fw={700}
        style={{ color: isActive ? "var(--gk-accent-secondary)" : "var(--mantine-color-gray-5)" }}>
        · {chip.count}
      </Text>
    </Box>
  );
}

// ── Sortable header ───────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";
type SortKey = "name" | "type" | "phone" | "email" | "trade" | "status" | "added" | "last_contact";

function sortValue(item: UnifiedInvite, key: SortKey): string {
  switch (key) {
    case "name": return item.name;
    case "type": return TYPE_LABELS[item.scenario];
    case "phone": return item.phone;
    case "email": return item.email;
    case "trade": return item.trade;
    case "status": return statusMeta(item).label;
    case "added": return item.invited_at;
    case "last_contact": return item.last_resent_at ?? item.invited_at;
  }
}

function SortableTh({
  col, sortBy, sortDir, onSort, width, children,
}: {
  col: SortKey; sortBy: SortKey | null; sortDir: SortDir; onSort: (col: SortKey) => void;
  width?: number; children: React.ReactNode;
}) {
  const active = sortBy === col;
  return (
    <Table.Th
      style={{ width, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", color: "#000" }}
      onClick={() => onSort(col)}
    >
      <Group gap={3} wrap="nowrap">
        <span>{children}</span>
        {active ? (
          sortDir === "asc" ? <IconChevronUp size={11} /> : <IconChevronDown size={11} />
        ) : (
          <IconArrowsSort size={10} style={{ opacity: 0.3 }} />
        )}
      </Group>
    </Table.Th>
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
  onChanged: () => void;
  resending: boolean;
  archiving: boolean;
}

function InviteRow({ item, onOpen, onResend, onArchive, onRemove, onToggleShow, onEditEndorsement, onChanged, resending, archiving }: RowProps) {
  const status = statusMeta(item);
  const eligible = !status.isTerminal && item.invite_id != null && canResend(item);
  const isCuratedPro = item.scenario === "pro" && item.is_on_platform;

  const lastIso = item.last_resent_at ?? item.invited_at;
  const days = daysSince(lastIso);

  return (
    <Table.Tr>
      <Table.Td style={{ maxWidth: 140, ...ellipsis }}>
        <Text component="a" onClick={onOpen} size="sm" fw={600} c="blue" style={{ cursor: "pointer", ...ellipsis }}>
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td style={{ maxWidth: 80 }}>
        <Badge size="xs" variant="light" color={TYPE_COLORS[item.scenario]}>{TYPE_LABELS[item.scenario]}</Badge>
      </Table.Td>
      <Table.Td style={{ maxWidth: 150 }}>
        <Group gap={6} wrap="nowrap">
          <PhoneChannelIcons
            scenario={item.scenario} inviteId={item.invite_id} phone={item.phone}
            smsCount={item.sms_count} whatsappCount={item.whatsapp_count} onChanged={onChanged}
          />
          <Text size="xs" c={item.phone ? undefined : "dimmed"} style={ellipsis}>{item.phone ? maskPhone(item.phone) : "—"}</Text>
        </Group>
      </Table.Td>
      <Table.Td style={{ maxWidth: 190 }}>
        <Group gap={6} wrap="nowrap">
          <EmailChannelIcon
            scenario={item.scenario} inviteId={item.invite_id} email={item.email}
            opened={item.status === "opened"} count={item.email_count} onChanged={onChanged}
          />
          <Text size="xs" c={item.email ? undefined : "dimmed"} style={ellipsis}>{item.email || "—"}</Text>
        </Group>
      </Table.Td>
      <Table.Td style={{ maxWidth: 100, ...ellipsis }}>
        <Text size="xs" c={item.trade ? undefined : "dimmed"} style={ellipsis}>{item.trade || "—"}</Text>
      </Table.Td>
      <Table.Td style={{ maxWidth: 90 }}>
        <Badge size="xs" variant="light" color={status.color}>{status.label}</Badge>
      </Table.Td>
      <Table.Td style={{ maxWidth: 130 }}>
        <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(item.invited_at)}</Text>
      </Table.Td>
      <Table.Td style={{ maxWidth: 130 }}>
        <Stack gap={0}>
          <Text size="xs" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(lastIso)}</Text>
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

export function InviteTimeline({ refreshKey, lockType, title }: { refreshKey: number; lockType?: InviteScenario; title?: string }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<UnifiedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, "loading" | "">>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  }
  const [endorsementTarget, setEndorsementTarget] = useState<UnifiedInvite | null>(null);
  const [endorsementDraft, setEndorsementDraft] = useState("");
  const [savingEndorsement, setSavingEndorsement] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [inviteData, pros] = await Promise.all([getInviteList(), getReferrerPros()]);
      const proCounts = new Map(inviteData.pro_invites.map((i) => [i.invite_id, i]));
      const merged: UnifiedInvite[] = [
        ...pros.map((p) => {
          const pc = p.invite_id != null ? proCounts.get(p.invite_id) : undefined;
          return {
            scenario: "pro" as const, id: p.id, invite_id: p.invite_id, name: p.name, trade: p.trade,
            phone: p.phone || "", email: p.email || "", channel: pc?.channel ?? "", status: p.invite_status || "pending",
            click_count: pc?.click_count ?? 0,
            email_count: pc?.email_count ?? 0, whatsapp_count: pc?.whatsapp_count ?? 0, sms_count: pc?.sms_count ?? 0,
            invited_at: p.added_at, last_resent_at: p.last_resent_at,
            is_on_platform: p.is_on_platform, show_on_page: p.show_on_page, endorsement: p.endorsement,
          };
        }),
        ...inviteData.friend_invites.map((i) => ({
          scenario: "friend" as const, id: i.invite_id, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count,
          email_count: i.email_count, whatsapp_count: i.whatsapp_count, sms_count: i.sms_count,
          invited_at: i.invited_at, last_resent_at: i.last_resent_at,
        })),
        ...inviteData.circle_invites.map((i) => ({
          scenario: "circle" as const, id: i.invite_id, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count,
          email_count: i.email_count, whatsapp_count: i.whatsapp_count, sms_count: i.sms_count,
          invited_at: i.invited_at, last_resent_at: i.last_resent_at,
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

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = sortValue(a, sortBy).localeCompare(sortValue(b, sortBy), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortBy, sortDir]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack gap="sm">

      {/* Title + single-line summary chips */}
      {!loading && items.length > 0 && (
        <Group
          gap={6}
          wrap="wrap"
          justify="space-between"
          align="center"
          pb={6}
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          {title ? (
            <Title order={5} style={{ color: "var(--gk-accent-secondary)" }}>
              {title}
            </Title>
          ) : <span />}

          <Group gap={6} wrap="wrap">
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
        <Box style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--mantine-color-default-border)" }}>
          <Table verticalSpacing={4} horizontalSpacing="xs" striped highlightOnHover style={{ tableLayout: "fixed" }}>
            <Table.Thead style={{
              background: "linear-gradient(135deg, var(--gk-accent-primary) 0%, var(--gk-accent-secondary) 100%)",
            }}>
              <Table.Tr style={{ color: "#000" }}>
                <SortableTh col="name" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={140}>Name</SortableTh>
                <SortableTh col="type" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={80}>Type</SortableTh>
                <SortableTh col="phone" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={150}>Phone</SortableTh>
                <SortableTh col="email" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={190}>Email</SortableTh>
                <SortableTh col="trade" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={100}>Trade</SortableTh>
                <SortableTh col="status" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={90}>Status</SortableTh>
                <SortableTh col="added" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={130}>Added</SortableTh>
                <SortableTh col="last_contact" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} width={130}>Last Contact</SortableTh>
                <Table.Th style={{ width: 90 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((item) => (
                <InviteRow
                  key={`${item.scenario}-${item.id}`}
                  item={item}
                  onOpen={() => openContact(item)}
                  onResend={() => handleResend(item)}
                  onArchive={() => handleArchive(item)}
                  onRemove={() => handleRemovePro(item)}
                  onToggleShow={() => handleToggleShow(item)}
                  onEditEndorsement={() => openEndorsementEditor(item)}
                  onChanged={() => void load()}
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
