import {
  Alert,
  Button,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  referrerName: string;
  onFollowed: (followerId: number, name: string) => void;
}

export function FollowModal({ opened, onClose, slug, referrerName, onFollowed }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!phone.trim() && !email.trim()) { setError("Phone or email is required."); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/${slug}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, email: email.trim() || null }),
        credentials: "include",
      });
      const data = await r.json() as { follower_id?: number; detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "Could not follow.");
      onFollowed(data.follower_id!, name.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Follow ${referrerName}`}
      centered
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Enter your details so {referrerName} can reach you when they refer a pro.
        </Text>
        <TextInput
          label="Your name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          label="Phone"
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextInput
          label="Email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <Alert color="red" variant="light">{error}</Alert>}
        <Button
          fullWidth
          radius="xl"
          loading={loading}
          style={{ background: "var(--gk-brand-gradient)" }}
          onClick={handleSubmit}
        >
          Follow
        </Button>
      </Stack>
    </Modal>
  );
}
