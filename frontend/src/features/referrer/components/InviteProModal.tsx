import {
  Alert,
  Button,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";

const TRADE_OPTIONS = [
  "Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Carpentry",
  "Flooring", "Landscaping", "General Contractor", "Cleaning", "Moving",
  "Pest Control", "Masonry", "Drywall", "Tile", "Other",
];

interface Props {
  opened: boolean;
  onClose: () => void;
  onInvited: () => void;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function InviteProModal({ opened, onClose, onInvited }: Props) {
  const [name, setName] = useState("");
  const [trade, setTrade] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!trade) { setError("Trade is required."); return; }
    if (!phone.trim() && !email.trim()) { setError("Phone or email is required to send the invite."); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/invite-pro`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim(), trade, phone: phone.trim() || null, email: email.trim() || null, note }),
      });
      const data = await r.json() as { detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "Failed to invite.");
      onInvited();
      onClose();
      setName(""); setTrade(null); setPhone(""); setEmail(""); setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Invite an off-platform pro" centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Add a pro who isn't on GigKraft yet. We'll send them an SMS invite to claim their free profile.
        </Text>
        <TextInput label="Pro's name" placeholder="Mike Johnson" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select
          label="Trade"
          placeholder="Pick a trade"
          data={TRADE_OPTIONS}
          value={trade}
          onChange={setTrade}
          required
          searchable
        />
        <TextInput label="Phone" placeholder="+1 555 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextInput label="Email" placeholder="mike@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Textarea
          label="Personal note (optional)"
          placeholder="Mike, I've referred you to a ton of clients and wanted to set you up with a free profile…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          minRows={2}
        />
        {error && <Alert color="red" variant="light">{error}</Alert>}
        <Button fullWidth radius="xl" loading={loading} onClick={handleSubmit}>
          Add to my page &amp; send invite
        </Button>
      </Stack>
    </Modal>
  );
}
