/**
 * Reusable "My Feedback" panel used inside both ProInboxPage and HomeMessagesPage.
 * Renders a left-list + right-detail layout for the user's own submitted feedback.
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  type FeedbackItem,
  listMyFeedback,
  replyToFeedback,
} from "../api/feedback";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Left-pane list ────────────────────────────────────────────────────────────
export function MyFeedbackList({
  items,
  loading,
  selectedId,
  onSelect,
}: {
  items: FeedbackItem[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  if (loading) {
    return (
      <Stack align="center" pt="xl">
        <Loader size="sm" />
      </Stack>
    );
  }
  if (items.length === 0) {
    return (
      <Stack align="center" pt="xl" gap="xs" px="sm">
        <Text size="xs" c="dimmed" ta="center">
          No feedback submitted yet. Use the button at the bottom-right of any page to send feedback.
        </Text>
      </Stack>
    );
  }
  return (
    <Stack gap={2}>
      {items.map((item) => (
        <Box
          key={item.id}
          p="xs"
          style={{
            cursor: "pointer",
            borderRadius: 8,
            background:
              selectedId === item.id
                ? "var(--mantine-color-violet-light)"
                : "transparent",
            borderLeft: selectedId === item.id ? "3px solid var(--mantine-color-violet-5)" : "3px solid transparent",
          }}
          onClick={() => onSelect(item.id)}
        >
          <Group justify="space-between" mb={2} wrap="nowrap">
            <Text size="xs" fw={700} c="dimmed">
              {item.ticket_number}
            </Text>
            <Group gap={4}>
              <Badge size="xs" color={item.status === "open" ? "blue" : "green"} variant="light">
                {item.status}
              </Badge>
              {item.replies.length > 0 && (
                <Badge size="xs" color="violet" variant="outline">
                  {item.replies.length}
                </Badge>
              )}
            </Group>
          </Group>
          <Text size="xs" lineClamp={2} c="dimmed">
            {item.text}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {timeAgo(item.created_at)}
          </Text>
        </Box>
      ))}
    </Stack>
  );
}

// ── Right-pane detail ─────────────────────────────────────────────────────────
export function MyFeedbackDetail({
  item,
  onUpdated,
}: {
  item: FeedbackItem;
  onUpdated: (updated: FeedbackItem) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const updated = await replyToFeedback(item.id, replyText.trim());
      onUpdated(updated);
      setReplyText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <Stack gap="md" p="md" style={{ height: "100%", overflowY: "auto" }}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <Text fw={700} size="sm">{item.ticket_number}</Text>
          <Badge size="xs" color={item.status === "open" ? "blue" : "green"} variant="filled">
            {item.status}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">{timeAgo(item.created_at)}</Text>
      </Group>

      <Card withBorder radius="md" p="sm">
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{item.text}</Text>
        {item.page_url && (
          <Text size="xs" c="dimmed" mt={4}>Page: {item.page_url}</Text>
        )}
      </Card>

      {item.replies.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">Replies from GigKraft</Text>
          {item.replies.map((reply) => (
            <Card key={reply.id} withBorder radius="md" p="sm" bg="var(--mantine-color-violet-light)">
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={600} c="violet">{reply.author_name}</Text>
                <Text size="xs" c="dimmed">{timeAgo(reply.created_at)}</Text>
              </Group>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{reply.text}</Text>
            </Card>
          ))}
        </Stack>
      )}

      {item.status === "open" && (
        <>
          <Divider />
          <Stack gap="xs">
            <Textarea
              placeholder="Add a follow-up..."
              minRows={2}
              autosize
              value={replyText}
              onChange={(e) => setReplyText(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button
                size="xs"
                leftSection={<IconMessageCircle size={13} />}
                loading={sending}
                disabled={!replyText.trim()}
                onClick={handleReply}
              >
                Follow up
              </Button>
            </Group>
          </Stack>
        </>
      )}
    </Stack>
  );
}

// ── Hook for shared state ─────────────────────────────────────────────────────
export function useMyFeedback(active: boolean) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    listMyFeedback().then(setItems).finally(() => setLoading(false));
  }, [active]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  function handleUpdated(updated: FeedbackItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return { items, loading, selectedId, setSelectedId, selected, handleUpdated };
}
