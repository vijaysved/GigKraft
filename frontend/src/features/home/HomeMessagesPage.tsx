import {
  ActionIcon,
  Box,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MOCK_THREADS = [
  { id: 1, pro: "John Smith", trade: "Plumber", preview: "Hi! I can come tomorrow between 9–noon.", time: "10m ago", unread: true },
  { id: 2, pro: "Dave Torres", trade: "Electrician", preview: "Quote sent: $320 for panel inspection.", time: "2h ago", unread: false },
];

const MOCK_MESSAGES = [
  { id: 1, from: "homeowner" as const, text: "Hi, my kitchen faucet has been dripping.", time: "10:00 AM" },
  { id: 2, from: "pro" as const, text: "Hi! I can come tomorrow 9–noon. Does that work?", time: "10:05 AM" },
  { id: 3, from: "homeowner" as const, text: "Yes that works. Thank you!", time: "10:08 AM" },
];

export function HomeMessagesPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  function send() {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: m.length + 1, from: "homeowner", text: draft.trim(), time: "now" }]);
    setDraft("");
  }

  if (!leadId) {
    return (
      <Stack>
        <Title order={3}>Messages</Title>
        {MOCK_THREADS.length === 0 ? (
          <Text size="sm" c="dimmed">No conversations yet.</Text>
        ) : (
          <Stack gap="sm">
            {MOCK_THREADS.map((t) => (
              <Card
                key={t.id}
                withBorder
                radius="md"
                padding="md"
                style={{ cursor: "pointer", borderColor: t.unread ? "var(--gk-accent-primary)" : undefined }}
                onClick={() => navigate(`/home/messages/${t.id}`)}
              >
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={t.unread ? 700 : 500}>{t.pro}</Text>
                    <Text size="xs" c="dimmed">{t.trade}</Text>
                    <Text size="sm" c="dimmed" truncate>{t.preview}</Text>
                  </Stack>
                  <Text size="xs" c="dimmed">{t.time}</Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    );
  }

  const thread = MOCK_THREADS.find((t) => t.id === parseInt(leadId));

  return (
    <Stack h="100%" maw={720}>
      <Group justify="space-between">
        <Stack gap={0}>
          <Title order={4}>{thread?.pro ?? "Chat"}</Title>
          <Text size="xs" c="dimmed">{thread?.trade}</Text>
        </Stack>
        <Text size="xs" c="dimmed" style={{ cursor: "pointer" }} onClick={() => navigate("/home/messages")}>
          ← All messages
        </Text>
      </Group>

      <Card withBorder radius="md" padding={0} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack gap={0} p="md" style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              mb="sm"
              style={{ display: "flex", justifyContent: msg.from === "homeowner" ? "flex-end" : "flex-start" }}
            >
              <Box
                p="sm"
                style={{
                  borderRadius: 12,
                  maxWidth: "70%",
                  background: msg.from === "homeowner" ? "var(--gk-accent-primary)" : "var(--gk-bg-surface)",
                  color: msg.from === "homeowner" ? "#fff" : "inherit",
                  border: msg.from === "pro" ? "1px solid var(--gk-border)" : "none",
                }}
              >
                <Text size="sm">{msg.text}</Text>
                <Text size="xs" opacity={0.6} mt={2}>{msg.time}</Text>
              </Box>
            </Box>
          ))}
        </Stack>
        <Divider />
        <Group p="sm" gap="xs">
          <TextInput
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            style={{ flex: 1 }}
          />
          <ActionIcon size="lg" color="blue" onClick={send}>
            <IconSend size={16} />
          </ActionIcon>
        </Group>
      </Card>
    </Stack>
  );
}
