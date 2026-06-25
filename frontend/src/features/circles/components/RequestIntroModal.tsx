import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";

interface Props {
  opened: boolean;
  onClose: () => void;
  circleProId: number;
  proName: string;
  slug: string;
}

export function RequestIntroModal({ opened, onClose, circleProId, proName, slug }: Props) {
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
      const res = await fetch(`${API_BASE_URL}/api/circles/${slug}/request-intro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          circle_pro_id: circleProId,
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
    <Modal opened={opened} onClose={handleClose} title={`Request an intro to ${proName}`} centered size="md">
      {done ? (
        <Stack align="center" py="lg" gap="sm">
          <Text fw={600}>Intro request sent!</Text>
          <Text c="dimmed" size="sm" ta="center">
            {proName} has been notified. You'll hear back once they confirm availability.
          </Text>
          <Button onClick={handleClose} variant="light">Close</Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Text size="sm" c="dimmed">
            {proName} isn't on Gigkraft yet. We'll send them your request — they'll reach out once they accept.
          </Text>
          <TextInput
            label="What do you need done?"
            placeholder="e.g. Algebra tutoring for 9th grader, twice a week"
            required
            value={form.job_title}
            onChange={(e) => set("job_title", e.currentTarget.value)}
          />
          <Textarea
            label="Additional details"
            placeholder="Grade level, availability, location preference…"
            rows={3}
            value={form.detail}
            onChange={(e) => set("detail", e.currentTarget.value)}
          />
          <TextInput
            label="Your address or area"
            placeholder="Springfield, IL"
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
              Send Intro Request
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
