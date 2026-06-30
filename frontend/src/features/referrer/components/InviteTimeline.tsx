import { Badge, Box, Group, Loader, Select, Stack, Table, Text, TextInput, Tooltip, ActionIcon } from "@mantine/core";
import { IconArchive, IconRefresh, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import {
  archiveCircleShare,
  archiveFriendInvite,
  archiveProInvite,
  getInviteList,
  resendCircleShare,
  resendFriendInvite,
  resendProInvite,
} from "../../../api/endpoints";
import type { InviteScenario } from "../types";
import { ContactTimelineDrawer } from "./ContactTimelineDrawer";

export interface UnifiedInvite {
  scenario: InviteScenario;
  invite_id: number;
  name: string;
  trade: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  click_count: number;
  invited_at: string;
  last_resent_at: string | null;
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
    if (item.status === "claimed") return { label: "Joined", color: "green", isTerminal: true };
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
  resending: boolean;
  archiving: boolean;
}

function InviteRow({ item, onSelect, onResend, onArchive, resending, archiving }: RowProps) {
  const status = statusMeta(item);
  const eligible = !status.isTerminal && canResend(item);

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
          <Tooltip label={eligible ? "Resend" : status.isTerminal ? status.label : "Wait 24h"} withArrow>
            <ActionIcon size="sm" variant="subtle" color="blue" disabled={!eligible} loading={resending} onClick={onResend}>
              <IconRefresh size={13} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Archive" withArrow>
            <ActionIcon size="sm" variant="subtle" color="gray" loading={archiving} onClick={onArchive}>
              <IconArchive size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export function InviteTimeline({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<UnifiedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, "loading" | "">>({});
  const [selected, setSelected] = useState<UnifiedInvite | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>("all");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");

  async function load() {
    setLoading(true);
    try {
      const data = await getInviteList();
      const merged: UnifiedInvite[] = [
        ...data.pro_invites.map((i) => ({
          scenario: "pro" as const, invite_id: i.invite_id, name: i.name, trade: i.trade, phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
        ...data.friend_invites.map((i) => ({
          scenario: "friend" as const, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
        ...data.circle_invites.map((i) => ({
          scenario: "circle" as const, invite_id: i.invite_id, name: i.name, trade: "", phone: i.phone, email: i.email,
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
    const key = `${item.scenario}-${item.invite_id}`;
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
    const key = `arch-${item.scenario}-${item.invite_id}`;
    setRowState((s) => ({ ...s, [key]: "loading" }));
    try {
      if (item.scenario === "pro") await archiveProInvite(item.invite_id);
      else if (item.scenario === "friend") await archiveFriendInvite(item.invite_id);
      else await archiveCircleShare(item.invite_id);
      setSelected((sel) => (sel && sel.scenario === item.scenario && sel.invite_id === item.invite_id ? null : sel));
      await load();
    } finally {
      setRowState((s) => ({ ...s, [key]: "" }));
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
        <Select
          data={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "sent", label: "Sent" },
            { value: "opened", label: "Opened" },
            { value: "clicked", label: "Clicked" },
            { value: "following", label: "Following" },
            { value: "joined", label: "Joined" },
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
          No invites sent yet. Use the buttons above to invite a pro, a friend, or share your circle.
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
                <Table.Th>Sent</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((item) => (
                <InviteRow
                  key={`${item.scenario}-${item.invite_id}`}
                  item={item}
                  onSelect={() => setSelected(item)}
                  onResend={() => handleResend(item)}
                  onArchive={() => handleArchive(item)}
                  resending={rowState[`${item.scenario}-${item.invite_id}`] === "loading"}
                  archiving={rowState[`arch-${item.scenario}-${item.invite_id}`] === "loading"}
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
        resending={selected ? rowState[`${selected.scenario}-${selected.invite_id}`] === "loading" : false}
        archiving={selected ? rowState[`arch-${selected.scenario}-${selected.invite_id}`] === "loading" : false}
      />
    </Stack>
  );
}
