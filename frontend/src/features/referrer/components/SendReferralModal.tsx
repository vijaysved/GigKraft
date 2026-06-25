import {
  Alert,
  Button,
  Modal,
  PinInput,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import type { ReferralRequestDetailOut, ReferrerProDashboardOut } from "../types";

interface Props {
  opened: boolean;
  onClose: () => void;
  request: ReferralRequestDetailOut;
  pros: ReferrerProDashboardOut[];
  onSent: () => void;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function SendReferralModal({ opened, onClose, request, pros, onSent }: Props) {
  const [proId, setProId] = useState<string | null>(
    request.pro_name ? null : null
  );
  const [noteFollower, setNoteFollower] = useState(
    `Hey ${request.follower_name}, I'm connecting you with a pro I trust!`
  );
  const [notePro, setNotePro] = useState(
    `Hi, I'm referring ${request.follower_name} to you — they need help with: ${request.job_description}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const proOptions = pros
    .filter((p) => p.is_on_platform || p.is_pending)
    .map((p) => ({ value: String(p.id), label: `${p.name} · ${p.trade}` }));

  // Pre-select the pro if the request already has one
  const defaultProId = pros.find((p) => p.name === request.pro_name);

  async function handleSend() {
    const selectedProId = proId ?? (defaultProId ? String(defaultProId.id) : null);
    if (!selectedProId) { setError("Please select a pro."); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/me/requests/${request.id}/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          referrer_pro_id: Number(selectedProId),
          note_to_follower: noteFollower,
          note_to_pro: notePro,
        }),
      });
      const data = await r.json() as { otp_required?: boolean; message?: string; detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "Failed to send.");
      if (data.otp_required) {
        setOtpRequired(true);
        setOtpMessage(data.message ?? "OTP sent.");
      } else {
        setSuccess(true);
        onSent();
        setTimeout(onClose, 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/referrer/me/requests/${request.id}/verify-follower-otp`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ otp }),
        }
      );
      const data = await r.json() as { verified?: boolean; error?: string; detail?: string };
      if (!r.ok) throw new Error(data.detail ?? "OTP check failed.");
      if (!data.verified) {
        setOtpError(data.error === "expired" ? "Code expired. Go back and resend." : "Incorrect code. Try again.");
        return;
      }
      setSuccess(true);
      onSent();
      setTimeout(onClose, 1500);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Send referral" centered size="md">
      <Stack gap="sm">
        {success ? (
          <Alert color="teal" variant="light">Referral sent! Both parties have been notified via SMS.</Alert>
        ) : otpRequired ? (
          <>
            <Alert color="blue" variant="light">{otpMessage}</Alert>
            <Text size="sm" c="dimmed">Enter the 6-digit code sent to {request.follower_name}'s phone:</Text>
            <PinInput length={6} type="number" value={otp} onChange={setOtp} />
            {otpError && <Alert color="red" variant="light">{otpError}</Alert>}
            <Button fullWidth radius="xl" loading={otpLoading} onClick={handleVerifyOtp}>
              Verify & send
            </Button>
          </>
        ) : (
          <>
            <Text size="sm">
              <b>{request.follower_name}</b> ({request.follower_phone}) needs:{" "}
              <i>{request.job_description || "no description"}</i>
            </Text>

            <Select
              label="Which pro?"
              data={proOptions}
              value={proId ?? (defaultProId ? String(defaultProId.id) : null)}
              onChange={setProId}
              required
            />

            <Textarea
              label="Message to follower"
              value={noteFollower}
              onChange={(e) => setNoteFollower(e.target.value)}
              minRows={2}
            />
            <Textarea
              label="Message to pro"
              value={notePro}
              onChange={(e) => setNotePro(e.target.value)}
              minRows={2}
            />

            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Button
              fullWidth
              radius="xl"
              loading={loading}
              style={{ background: "var(--gk-brand-gradient)" }}
              onClick={handleSend}
            >
              Send to both
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
