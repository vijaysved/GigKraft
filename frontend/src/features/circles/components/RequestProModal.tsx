import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";

interface Props {
  opened: boolean;
  onClose: () => void;
  proId: number | null;
  circleProId: number;
  proName: string;
  slug: string;
}

export function RequestProModal({ opened, onClose, proId, circleProId, proName, slug }: Props) {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ job_title: "", detail: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (status !== "authenticated") {
      navigate(`/login?returnTo=/circle/${slug}`);
      return;
    }
    if (!form.job_title.trim()) {
      setError("Please describe the task.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/circles/${slug}/request-pro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          circle_pro_id: circleProId,
          pro_id: proId,
          seeker_name: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
          seeker_phone: user?.phone ?? "",
          job_title: form.job_title,
          detail: form.detail,
          address: form.address,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { detail?: string };
        throw new Error(data.detail ?? "Request failed.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDone(false);
    setError(null);
    setForm({ job_title: "", detail: "", address: "" });
    onClose();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={`Request ${proName}`} centered size="md">
      {done ? (
        <Stack align="center" py="lg" gap="sm">
          <Text fw={600}>Request sent!</Text>
          <Text c="dimmed" size="sm" ta="center">
            {proName} has been notified and will be in touch shortly.
          </Text>
          <Button onClick={handleClose} variant="light">Close</Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          {error && <Alert color="red" variant="light">{error}</Alert>}
          {status !== "authenticated" && (
            <Alert color="blue" variant="light">
              You'll be asked to sign in before your request is submitted.
            </Alert>
          )}
          <TextInput
            label="What do you need done?"
            placeholder="e.g. Fix leaking garbage disposal under the kitchen sink"
            required
            value={form.job_title}
            onChange={(e) => set("job_title", e.currentTarget.value)}
          />
          <Textarea
            label="Additional details"
            placeholder="Any extra context, urgency, or notes for the pro…"
            rows={3}
            value={form.detail}
            onChange={(e) => set("detail", e.currentTarget.value)}
          />
          <TextInput
            label="Your address"
            placeholder="123 Main St, Springfield"
            value={form.address}
            onChange={(e) => set("address", e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={handleClose}>Cancel</Button>
            <Button
              loading={submitting}
              onClick={handleSubmit}
              style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
            >
              Send Request
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
