import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconMessage2, IconMessageCircle, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  type FeedbackItem,
  listAllFeedback,
  replyToFeedback,
  updateFeedbackStatus,
} from "../../api/feedback";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function FeedbackDetail({
  item,
  onUpdated,
}: {
  item: FeedbackItem;
  onUpdated: (updated: FeedbackItem) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);

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

  async function handleToggleStatus() {
    setToggling(true);
    try {
      const next = item.status === "open" ? "resolved" : "open";
      const updated = await updateFeedbackStatus(item.id, next);
      onUpdated(updated);
    } finally {
      setToggling(false);
    }
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <Text fw={700} size="sm">
            {item.ticket_number}
          </Text>
          <Badge
            size="xs"
            color={item.status === "open" ? "blue" : "green"}
            variant="filled"
          >
            {item.status}
          </Badge>
          {item.submitter ? (
            <Badge size="xs" color="violet" variant="light" leftSection={<IconUser size={10} />}>
              {item.submitter}
            </Badge>
          ) : (
            <Badge size="xs" color="gray" variant="light">
              Anonymous
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {timeAgo(item.created_at)}
        </Text>
      </Group>

      {/* Original message */}
      <Card withBorder radius="md" p="sm" bg="var(--mantine-color-default)">
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {item.text}
        </Text>
        {item.page_url && (
          <Text size="xs" c="dimmed" mt={4}>
            Page: {item.page_url}
          </Text>
        )}
      </Card>

      {/* Replies */}
      {item.replies.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Replies
          </Text>
          {item.replies.map((reply) => (
            <Card key={reply.id} withBorder radius="md" p="sm" bg="var(--mantine-color-violet-light)">
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={600} c="violet">
                  {reply.author_name}
                </Text>
                <Text size="xs" c="dimmed">
                  {timeAgo(reply.created_at)}
                </Text>
              </Group>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {reply.text}
              </Text>
            </Card>
          ))}
        </Stack>
      )}

      <Divider />

      {/* Reply composer */}
      <Stack gap="xs">
        <Textarea
          placeholder="Write a reply..."
          minRows={2}
          autosize
          value={replyText}
          onChange={(e) => setReplyText(e.currentTarget.value)}
        />
        <Group justify="space-between">
          <Button
            size="xs"
            variant="subtle"
            color={item.status === "open" ? "green" : "blue"}
            loading={toggling}
            onClick={handleToggleStatus}
          >
            Mark as {item.status === "open" ? "resolved" : "open"}
          </Button>
          <Button
            size="xs"
            leftSection={<IconMessageCircle size={14} />}
            loading={sending}
            disabled={!replyText.trim()}
            onClick={handleReply}
          >
            Send reply
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}

export function GkAdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    listAllFeedback(filter === "all" ? undefined : filter)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [filter]);

  function handleUpdated(updated: FeedbackItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelected(updated);
  }

  const displayed = items;

  return (
    <Box p="md">
      <Group mb="md" justify="space-between">
        <Group gap="xs">
          <IconMessage2 size={20} />
          <Title order={4}>Feedback</Title>
          <Badge size="sm" color="violet" variant="filled">
            {items.length}
          </Badge>
        </Group>
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={setFilter}
          data={[
            { label: "All", value: "all" },
            { label: "Open", value: "open" },
            { label: "Resolved", value: "resolved" },
          ]}
        />
      </Group>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : displayed.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl" size="sm">
          No feedback yet.
        </Text>
      ) : (
        <Group align="flex-start" gap="md" wrap="nowrap" style={{ minHeight: "60vh" }}>
          {/* List */}
          <ScrollArea style={{ width: 320, flexShrink: 0 }} h="75vh">
            <Stack gap="xs" pr="xs">
              {displayed.map((item) => (
                <Card
                  key={item.id}
                  withBorder
                  radius="md"
                  p="sm"
                  style={{
                    cursor: "pointer",
                    borderColor:
                      selected?.id === item.id
                        ? "var(--mantine-color-violet-5)"
                        : undefined,
                    opacity: item.status === "resolved" ? 0.65 : 1,
                  }}
                  onClick={() => setSelected(item)}
                >
                  <Group justify="space-between" mb={4} wrap="nowrap">
                    <Text size="xs" fw={700}>
                      {item.ticket_number}
                    </Text>
                    <Group gap={4}>
                      <Badge size="xs" color={item.status === "open" ? "blue" : "green"}>
                        {item.status}
                      </Badge>
                      {item.replies.length > 0 && (
                        <Badge size="xs" color="gray" variant="outline">
                          {item.replies.length} {item.replies.length === 1 ? "reply" : "replies"}
                        </Badge>
                      )}
                    </Group>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {item.text}
                  </Text>
                  <Group justify="space-between" mt={4}>
                    <Text size="xs" c="dimmed">
                      {item.submitter ?? "Anonymous"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {timeAgo(item.created_at)}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </ScrollArea>

          {/* Detail */}
          <Box style={{ flex: 1 }}>
            {selected ? (
              <Card withBorder radius="md" p="md">
                <FeedbackDetail
                  key={selected.id}
                  item={selected}
                  onUpdated={handleUpdated}
                />
              </Card>
            ) : (
              <Text c="dimmed" ta="center" py="xl" size="sm">
                Select a feedback item to view details.
              </Text>
            )}
          </Box>
        </Group>
      )}
    </Box>
  );
}
