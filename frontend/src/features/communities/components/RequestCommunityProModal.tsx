import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

import { useAuth } from "../../../auth/AuthContext";
import { communityFetch } from "../hooks/useCommunity";
import type { CommunityProOut } from "../types";

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  pro: CommunityProOut | null;
}

export function RequestCommunityProModal({ opened, onClose, slug, pro }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ job_title: "", detail: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleClose() {
    setDone(false);
    setError(null);
    setForm({ job_title: "", detail: "", address: "" });
    onClose();
  }

  async function handleSubmit() {
    if (!pro) return;
    if (!form.job_title.trim()) {
      setError("Please describe the task.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const path = pro.is_off_platform ? "request-intro" : "request-pro";
      const res = await communityFetch(`/api/communities/${slug}/${path}`, {
        method: "POST",
        body: JSON.stringify({
          community_pro_id: pro.id,
          seeker_name: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
          seeker_phone: user?.phone ?? "",
          job_title: form.job_title,
          detail: form.detail,
          address: form.address,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { detail?: string };
        throw new Error(data.detail ?? "Request failed.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={pro ? `Request ${pro.display_name}` : ""} centered size="md">
      {done ? (
        <Stack gap="sm">
          <Text size="sm">Your request has been sent! You'll hear back soon.</Text>
          <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={handleClose}>Done</Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          <TextInput
            label="What do you need done?"
            placeholder="e.g. Fix a leaking faucet"
            value={form.job_title}
            onChange={(e) => set("job_title", e.currentTarget.value)}
            required
          />
          <Textarea
            label="Details (optional)"
            value={form.detail}
            onChange={(e) => set("detail", e.currentTarget.value)}
            minRows={3}
          />
          <TextInput
            label="Address (optional)"
            value={form.address}
            onChange={(e) => set("address", e.currentTarget.value)}
          />
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Group justify="flex-end">
            <Button variant="subtle" size="xs" radius="xl" onClick={handleClose}>Cancel</Button>
            <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void handleSubmit()}>
              Send Request
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
