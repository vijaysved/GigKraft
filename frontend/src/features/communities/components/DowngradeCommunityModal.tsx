import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";

import { communityFetch } from "../hooks/useCommunity";

interface Props {
  opened: boolean;
  onClose: () => void;
  communityName: string;
  onDowngraded: () => void;
}

export function DowngradeCommunityModal({ opened, onClose, communityName, onDowngraded }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await communityFetch("/api/me/community/downgrade", { method: "POST" });
      if (!res.ok) {
        const data = await res.json() as { detail?: string };
        throw new Error(data.detail ?? "Could not downgrade.");
      }
      onDowngraded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Downgrade to Free" centered>
      <Stack gap="sm">
        <Text size="sm">
          This cancels your Community Directory subscription. <strong>{communityName}</strong> stays live and
          browsable for your members forever, but becomes read-only — no new members, pro list edits, or
          requests until you resubscribe.
        </Text>
        {error && <Alert color="red" variant="light">{error}</Alert>}
        <Group justify="flex-end">
          <Button variant="subtle" size="xs" radius="xl" onClick={onClose}>Cancel</Button>
          <Button color="red" size="xs" radius="xl" loading={submitting} onClick={() => void handleConfirm()}>
            Downgrade to Free
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
