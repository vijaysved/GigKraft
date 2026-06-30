import { ActionIcon, Badge, Box, Loader, Stack, Text, Tooltip } from "@mantine/core";
import { IconArchive, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

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

function relativeTime(isoStr: string) {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function canResend(item: UnifiedInvite) {
  const last = item.last_resent_at || item.invited_at;
  return (Date.now() - new Date(last).getTime()) / 1000 > 86400;
}

const DOT_COLORS: Record<InviteScenario, string> = {
  pro: "var(--mantine-color-blue-5)",
  friend: "var(--mantine-color-orange-5)",
  circle: "var(--mantine-color-grape-5)",
};

const SCENARIO_LABELS: Record<InviteScenario, string> = {
  pro: "Invited a Pro",
  friend: "Invited a Friend",
  circle: "Shared Circle",
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

function DotCol({ color, isLast }: { color: string; isLast: boolean }) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0, paddingTop: 3 }}>
      <Box style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {!isLast && (
        <Box style={{ width: 2, flex: 1, minHeight: 24, background: "var(--mantine-color-default-border)", marginTop: 4 }} />
      )}
    </Box>
  );
}

interface RowProps {
  item: UnifiedInvite;
  isLast: boolean;
  onSelect: () => void;
  onResend: () => void;
  onArchive: () => void;
  resending: boolean;
  archiving: boolean;
}

function TimelineRow({ item, isLast, onSelect, onResend, onArchive, resending, archiving }: RowProps) {
  const status = statusMeta(item);
  const eligible = !status.isTerminal && canResend(item);

  return (
    <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      <DotCol color={DOT_COLORS[item.scenario]} isLast={isLast} />
      <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <Box style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, paddingLeft: 8 }}>
          <Text size="xs" c="dimmed" style={{ width: 110, flexShrink: 0 }}>{relativeTime(item.invited_at)}</Text>
          <Text size="sm" fw={600} style={{ cursor: "pointer" }} onClick={onSelect}>
            {item.name}
          </Text>
          <Badge size="xs" variant="light" color="gray">{SCENARIO_LABELS[item.scenario]}</Badge>
          <Badge size="xs" variant="light" color={status.color}>{status.label}</Badge>
          <Text size="xs" c="dimmed">{maskPhone(item.phone)}</Text>
          <Box style={{ flex: 1 }} />
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
        </Box>
      </Box>
    </Box>
  );
}

export function InviteTimeline({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<UnifiedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowState, setRowState] = useState<Record<string, "loading" | "">>({});
  const [selected, setSelected] = useState<UnifiedInvite | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getInviteList();
      const merged: UnifiedInvite[] = [
        ...data.pro_invites.map((i) => ({
          scenario: "pro" as const, invite_id: i.invite_id, name: i.name, phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
        ...data.friend_invites.map((i) => ({
          scenario: "friend" as const, invite_id: i.invite_id, name: i.name, phone: i.phone, email: i.email,
          channel: i.channel, status: i.status, click_count: i.click_count, invited_at: i.invited_at,
          last_resent_at: i.last_resent_at,
        })),
        ...data.circle_invites.map((i) => ({
          scenario: "circle" as const, invite_id: i.invite_id, name: i.name, phone: i.phone, email: i.email,
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

  return (
    <Stack gap="xs">
      {loading ? (
        <Loader size="xs" />
      ) : items.length === 0 ? (
        <Text size="sm" c="dimmed" py="sm">
          No invites sent yet. Use the buttons above to invite a pro, a friend, or share your circle.
        </Text>
      ) : (
        <Box>
          {items.map((item, i) => (
            <TimelineRow
              key={`${item.scenario}-${item.invite_id}`}
              item={item}
              isLast={i === items.length - 1}
              onSelect={() => setSelected(item)}
              onResend={() => handleResend(item)}
              onArchive={() => handleArchive(item)}
              resending={rowState[`${item.scenario}-${item.invite_id}`] === "loading"}
              archiving={rowState[`arch-${item.scenario}-${item.invite_id}`] === "loading"}
            />
          ))}
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
