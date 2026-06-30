import { Badge, Box, Button, Drawer, Group, Loader, Stack, Text } from "@mantine/core";
import { IconArchive, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { getInviteContactTimeline } from "../../../api/endpoints";
import type { InviteTimelineEventOut } from "../types";
import type { UnifiedInvite } from "./InviteTimeline";

const SCENARIO_LABELS: Record<UnifiedInvite["scenario"], string> = {
  pro: "Pro",
  friend: "Friend",
  circle: "Circle",
};

const EVENT_META: Record<InviteTimelineEventOut["event_type"], { label: string; color: string }> = {
  sent: { label: "Sent", color: "var(--mantine-color-blue-5)" },
  resent: { label: "Resent", color: "var(--mantine-color-teal-5)" },
  clicked: { label: "Link Clicked", color: "var(--mantine-color-grape-5)" },
  joined: { label: "Joined", color: "var(--mantine-color-green-6)" },
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
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

function EventRow({ event, isLast }: { event: InviteTimelineEventOut; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const meta = EVENT_META[event.event_type];
  const expandable = !!event.message_body;

  return (
    <Box style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      <DotCol color={meta.color} isLast={isLast} />
      <Box style={{ flex: 1, paddingBottom: isLast ? 0 : 16, paddingLeft: 8 }}>
        <Box
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: expandable ? "pointer" : "default" }}
          onClick={() => expandable && setExpanded((e) => !e)}
        >
          <Text size="xs" c="dimmed" style={{ width: 130, flexShrink: 0 }}>{fmtDateTime(event.occurred_at)}</Text>
          <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
        {expandable && expanded && (
          <Text size="sm" c="dimmed" mt={6} style={{ whiteSpace: "pre-wrap" }}>
            {event.message_body}
          </Text>
        )}
      </Box>
    </Box>
  );
}

interface Props {
  opened: boolean;
  onClose: () => void;
  contact: UnifiedInvite | null;
  onResend: () => void;
  onArchive: () => void;
  resending: boolean;
  archiving: boolean;
}

export function ContactTimelineDrawer({ opened, onClose, contact, onResend, onArchive, resending, archiving }: Props) {
  const [events, setEvents] = useState<InviteTimelineEventOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!opened || !contact) return;
    setLoading(true);
    getInviteContactTimeline(contact.scenario, contact.invite_id)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [opened, contact]);

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="md" title="Contact Timeline">
      {contact && (
        <Stack gap="lg">
          <Box
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text fw={700}>{contact.name}</Text>
                <Text size="xs" c="dimmed">
                  {contact.phone ? `•••• ${contact.phone.slice(-4)}` : contact.email || "—"}
                </Text>
              </Stack>
              <Badge size="sm" variant="light" color="gray">{SCENARIO_LABELS[contact.scenario]}</Badge>
            </Group>
          </Box>

          {loading ? (
            <Loader size="xs" />
          ) : events.length === 0 ? (
            <Text size="sm" c="dimmed">No activity recorded yet.</Text>
          ) : (
            <Box>
              {events.map((e, i) => (
                <EventRow key={`${e.event_type}-${e.occurred_at}`} event={e} isLast={i === events.length - 1} />
              ))}
            </Box>
          )}

          <Group justify="flex-end">
            <Button
              size="xs" variant="default" leftSection={<IconRefresh size={13} />}
              loading={resending} onClick={onResend}
            >
              Resend
            </Button>
            <Button
              size="xs" variant="default" color="red" leftSection={<IconArchive size={13} />}
              loading={archiving} onClick={onArchive}
            >
              Archive
            </Button>
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}
