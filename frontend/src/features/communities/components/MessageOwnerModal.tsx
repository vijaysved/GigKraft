import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

import { useAuth } from "../../../auth/AuthContext";
import { communityFetch } from "../hooks/useCommunity";

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  ownerName: string;
}

export function MessageOwnerModal({ opened, onClose, slug, ownerName }: Props) {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";
  const [guestName, setGuestName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleClose() {
    setDone(false);
    setError(null);
    setGuestName("");
    setBody("");
    onClose();
  }

  async function handleSubmit() {
    if (!body.trim()) {
      setError("Please write a message.");
      return;
    }
    if (!isAuthenticated && !guestName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/message-owner`, {
        method: "POST",
        body: JSON.stringify({ body: body.trim(), guest_name: guestName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { detail?: string };
        throw new Error(data.detail ?? "Could not send message.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={`Message ${ownerName}`} centered size="md">
      {done ? (
        <Stack gap="sm">
          <Text size="sm">Your message has been sent to {ownerName}'s inbox!</Text>
          {!isAuthenticated && (
            <Text size="xs" c="dimmed">
              You sent this as a guest, so you won't see a reply here — sign in or create an account to keep the conversation going.
            </Text>
          )}
          <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={handleClose}>Done</Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          {!isAuthenticated && (
            <TextInput
              label="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.currentTarget.value)}
              required
            />
          )}
          <Textarea
            label="Message"
            placeholder={`Say hi to ${ownerName}…`}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            minRows={4}
            required
          />
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Group justify="flex-end">
            <Button variant="subtle" size="xs" radius="xl" onClick={handleClose}>Cancel</Button>
            <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void handleSubmit()}>
              Send
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
