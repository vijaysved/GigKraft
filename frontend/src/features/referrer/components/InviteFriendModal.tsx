import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";

interface Invitee {
  name: string;
  phone: string;
  email: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function InviteFriendModal({ opened, onClose }: Props) {
  const [invitees, setInvitees] = useState<Invitee[]>([{ name: "", phone: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function addRow() {
    if (invitees.length >= 10) return;
    setInvitees([...invitees, { name: "", phone: "", email: "" }]);
  }

  function updateRow(i: number, field: keyof Invitee, val: string) {
    setInvitees(invitees.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function removeRow(i: number) {
    setInvitees(invitees.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    const valid = invitees.filter((r) => r.name.trim() && (r.phone.trim() || r.email.trim()));
    if (valid.length === 0) { setError("Add at least one invitee with a name and phone/email."); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/invite-friend`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          invitees: valid.map((i) => ({ name: i.name.trim(), phone: i.phone.trim() || null, email: i.email.trim() || null })),
        }),
      });
      const data = await r.json() as { sent_count?: number; detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "Failed.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSent(false);
    setInvitees([{ name: "", phone: "", email: "" }]);
    setError(null);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Invite friends" centered size="lg">
      <Stack gap="sm">
        {sent ? (
          <Alert color="teal" variant="light">Invites sent! Your friends will receive an SMS with a link to your page.</Alert>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Send your friends a link to your referrer page so they can follow you and request referrals.
            </Text>

            {invitees.map((inv, i) => (
              <Group key={i} gap="xs" align="flex-end" wrap="nowrap">
                <TextInput
                  label={i === 0 ? "Name" : undefined}
                  placeholder="Jane"
                  value={inv.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  style={{ flex: 1 }}
                />
                <TextInput
                  label={i === 0 ? "Phone" : undefined}
                  placeholder="+1 555…"
                  value={inv.phone}
                  onChange={(e) => updateRow(i, "phone", e.target.value)}
                  style={{ flex: 1 }}
                />
                <TextInput
                  label={i === 0 ? "Email" : undefined}
                  placeholder="jane@…"
                  value={inv.email}
                  onChange={(e) => updateRow(i, "email", e.target.value)}
                  style={{ flex: 1 }}
                />
                {invitees.length > 1 && (
                  <ActionIcon color="red" variant="subtle" onClick={() => removeRow(i)} mb={2}>
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Group>
            ))}

            {invitees.length < 10 && (
              <Button size="xs" variant="subtle" leftSection={<IconPlus size={12} />} onClick={addRow}>
                Add another
              </Button>
            )}

            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Button fullWidth radius="xl" loading={loading} onClick={handleSubmit}>
              Send invites
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
