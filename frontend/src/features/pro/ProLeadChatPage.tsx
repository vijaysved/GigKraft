import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Message {
  id: number;
  from: "pro" | "homeowner";
  text: string;
  time: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: 1, from: "homeowner", text: "Hi, my kitchen faucet has been dripping for a week now.", time: "10:00 AM" },
  { id: 2, from: "pro", text: "Hi! I can come take a look tomorrow between 9am and noon. Does that work?", time: "10:05 AM" },
  { id: 3, from: "homeowner", text: "Yes that works perfectly. Thank you!", time: "10:08 AM" },
];

export function ProLeadChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");

  function send() {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: m.length + 1, from: "pro", text: draft.trim(), time: "now" }]);
    setDraft("");
  }

  return (
    <Stack h="100%" style={{ maxWidth: 800 }}>
      <Group>
        <ActionIcon variant="subtle" onClick={() => navigate("/pro/leads")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Title order={4}>Lead #{id} — Chat</Title>
      </Group>

      <Card withBorder radius="md" padding={0} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box p="md" style={{ borderBottom: "1px solid var(--gk-border)" }}>
          <Group gap="xs">
            <Button size="xs" variant="light">Send quote</Button>
            <Button size="xs" variant="light">Send invoice</Button>
            <Button size="xs" variant="light" color="green">Mark complete</Button>
            <Button size="xs" variant="light" color="blue">Request review</Button>
          </Group>
        </Box>

        <Stack gap={0} p="md" style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
          {messages.map((msg) => (
            <Box key={msg.id} mb="sm" style={{ display: "flex", justifyContent: msg.from === "pro" ? "flex-end" : "flex-start" }}>
              <Box
                p="sm"
                style={{
                  borderRadius: 12,
                  maxWidth: "70%",
                  background: msg.from === "pro" ? "var(--gk-accent-primary)" : "var(--gk-bg-surface)",
                  color: msg.from === "pro" ? "#fff" : "inherit",
                  border: msg.from === "homeowner" ? "1px solid var(--gk-border)" : "none",
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
