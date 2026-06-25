import {
  Alert,
  Button,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";
import type { ProCardOut } from "../types";

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  referrerName: string;
  selectedPro: ProCardOut | null;
  pros: ProCardOut[];
  onRequested: () => void;
}

export function RequestReferralModal({
  opened,
  onClose,
  slug,
  referrerName,
  selectedPro,
  pros,
  onRequested,
}: Props) {
  const [proId, setProId] = useState<string | null>(
    selectedPro ? String(selectedPro.id) : null
  );
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const proOptions = pros
    .filter((p) => !p.is_pending)
    .map((p) => ({ value: String(p.id), label: `${p.name} · ${p.trade}` }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/${slug}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrer_pro_id: proId ? Number(proId) : null,
          job_description: jobDescription.trim() || null,
        }),
        credentials: "include",
      });
      const data = await r.json() as { detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "Could not submit request.");
      setSuccess(true);
      onRequested();
      setTimeout(onClose, 1500);
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
      title={`Request a referral from ${referrerName}`}
      centered
    >
      <Stack gap="sm">
        {success ? (
          <Alert color="teal" variant="light">
            Request sent! {referrerName} will reach out soon.
          </Alert>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              {referrerName} will get an SMS and personally connect you with the pro.
            </Text>
            {proOptions.length > 0 && (
              <Select
                label="Which pro?"
                placeholder="Pick a pro (optional)"
                data={proOptions}
                value={proId}
                onChange={setProId}
                clearable
              />
            )}
            <Textarea
              label="What do you need help with?"
              placeholder="Leaking faucet in kitchen, need someone ASAP…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              minRows={3}
            />
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Button
              fullWidth
              radius="xl"
              loading={loading}
              style={{ background: "var(--gk-brand-gradient)" }}
              onClick={handleSubmit}
            >
              Send request
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
