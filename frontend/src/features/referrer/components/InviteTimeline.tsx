import {
  ActionIcon, Badge, Box, Button, Group, Loader, Modal, Select, Stack,
  Switch, Table, Text, Textarea, TextInput, Tooltip,
} from "@mantine/core";
import { IconArchive, IconPencil, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

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
import { ContactTimelineDrawer } from "./ContactTimelineDrawer";

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

function canResend(item: UnifiedInvite) {
  const last = item.last_resent_at || item.invited_at;
  return (Date.now() - new Date(last).getTime()) / 1000 > 86400;
}

const TYPE_LABELS: Record<InviteScenario, string> = {
  pro: "Pro",
  friend: "Friend",
  circle: "Circle",
};

const TYPE_COLORS: Record<InviteScenario, string> = {
  pro: "blue",
  friend: "orange",
  circle: "grape",
};

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

interface RowProps {
  item: UnifiedInvite;
  onSelect: () => void;
  onResend: () => void;
  onArchive: () => void;
  onRemove: () => void;
  onToggleShow: () => void;
  onEditEndorsement: () => void;
  resending: boolean;
  archiving: boolean;
}

function InviteRow({ item, onSelect, onResend, onArchive, onRemove, onToggleShow, onEditEndorsement, resending, archiving }: RowProps) {
  const status = statusMeta(item);
  const eligible = !status.isTerminal && item.invite_id != null && canResend(item);
  const isCuratedPro = item.scenario === "pro" && item.is_on_platform;

  return (
    <Table.Tr>
      <Table.Td>
        <Text component="a" onClick={onSelect} size="sm" fw={600} c="blue" style={{ cursor: "pointer" }}>
          {item.name}
        </Text>
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

export function InviteTimeline({ refreshKey, lockType }: { refreshKey: number; lockType?: InviteScenario }) {
  const [items, setItems] = useState<UnifiedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, "loading" | "">>({});
  const [selected, setSelected] = useState<UnifiedInvite | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(lockType ?? "all");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
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

  useEffect(() => {
    void load();
  }, [refreshKey]);

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
      setSelected((sel) => (sel && sel.scenario === item.scenario && sel.id === item.id ? null : sel));
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
      setSelected((sel) => (sel && sel.scenario === item.scenario && sel.id === item.id ? null : sel));
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

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { pro: 0, friend: 0, circle: 0 };
    for (const i of items) counts[i.scenario]++;
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (typeFilter && typeFilter !== "all" && i.scenario !== typeFilter) return false;
      if (statusFilter && statusFilter !== "all" && statusMeta(i).label.toLowerCase() !== statusFilter) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !i.phone.includes(q)) return false;
      return true;
    });
  }, [items, search, typeFilter, statusFilter]);

  return (
    <Stack gap="sm">
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search name, email, or phone…"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        {!lockType && (
          <Select
            data={[
              { value: "all", label: `All types (${items.length})` },
              { value: "pro", label: `Pros (${typeCounts.pro})` },
              { value: "friend", label: `Friends (${typeCounts.friend})` },
              { value: "circle", label: `Circle (${typeCounts.circle})` },
            ]}
            value={typeFilter}
            onChange={setTypeFilter}
            w={170}
          />
        )}
        <Select
          data={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "sent", label: "Sent" },
            { value: "opened", label: "Opened" },
            { value: "clicked", label: "Clicked" },
            { value: "following", label: "Following" },
            { value: "on platform", label: "On Platform" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          w={160}
        />
      </Group>

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
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((item) => (
                <InviteRow
                  key={`${item.scenario}-${item.id}`}
                  item={item}
                  onSelect={() => setSelected(item)}
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

      <ContactTimelineDrawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        contact={selected}
        onResend={() => selected && handleResend(selected)}
        onArchive={() => selected && handleArchive(selected)}
        resending={selected ? rowState[`${selected.scenario}-${selected.id}`] === "loading" : false}
        archiving={selected ? rowState[`arch-${selected.scenario}-${selected.id}`] === "loading" : false}
      />

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
