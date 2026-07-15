import { Alert, Avatar, Button, Center, Divider, Group, Modal, PinInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconUsersGroup } from "@tabler/icons-react";
import { useState } from "react";

import { useAuth } from "../../../auth/AuthContext";
import { GoogleSignInButton } from "../../../components/GoogleSignInButton";
import { otpRequest, patchMe } from "../../../api/endpoints";
import { brandCssVars } from "../../../theme/themes";
import { communityFetch } from "../hooks/useCommunity";

// Phone/OTP join is built but disabled for now — flip this back on to re-enable it.
const SHOW_PHONE_JOIN = false;

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  communityName: string;
  coverImageUrl?: string | null;
  theme?: string | null;
  onJoined: () => void;
}

type Step = "start" | "otp" | "name" | "joining" | "done";

export function JoinCommunityModal({ opened, onClose, slug, communityName, coverImageUrl, theme, onJoined }: Props) {
  const { loginWithPhoneOtp, loginWithGoogle, updateUser } = useAuth();
  const [step, setStep] = useState<Step>("start");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep("start");
    setPhone("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function finishJoining() {
    setStep("joining");
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/join`, { method: "POST" });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Could not join this Community.");
      setStep("done");
      onJoined();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("name");
    }
  }

  async function afterAuth(user: { first_name: string }) {
    if (!user.first_name.trim()) {
      setStep("name");
      return;
    }
    await finishJoining();
  }

  async function sendOtp() {
    if (!phone.trim()) { setError("Enter your phone number."); return; }
    setSendingOtp(true);
    setError(null);
    try {
      await otpRequest(phone.trim());
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send code.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    setVerifying(true);
    setError(null);
    try {
      const { user } = await loginWithPhoneOtp(phone.trim(), otp);
      await afterAuth(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code.");
    } finally {
      setVerifying(false);
    }
  }

  async function joinWithGoogle(idToken: string) {
    setError(null);
    const { user } = await loginWithGoogle(idToken, "member");
    await afterAuth(user);
  }

  async function confirmName() {
    if (!firstName.trim()) { setError("Please enter your name."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await patchMe({ first_name: firstName.trim(), last_name: lastName.trim() });
      updateUser(updated);
      await finishJoining();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="sm"
      styles={{
        content: {
          ...brandCssVars(theme),
          border: "3px solid var(--gk-accent-secondary)",
          borderRadius: 16,
        },
        header: { ...brandCssVars(theme), minHeight: 0, paddingBottom: 0 },
      }}
    >
      <Stack align="center" gap={4} mb="sm">
        <Group gap={8} justify="center" wrap="nowrap">
          <Avatar
            src={coverImageUrl || undefined}
            size={40}
            radius="xl"
            color="teal"
            style={{ border: "2px solid var(--gk-accent-primary)", flexShrink: 0 }}
          >
            <IconUsersGroup size={20} />
          </Avatar>
          <Text fw={800} size="lg" style={{ color: "var(--gk-accent-primary)" }}>
            {communityName}
          </Text>
        </Group>
        <Title order={4} ta="center" style={{ color: "#000" }}>
          Join
        </Title>
      </Stack>

      <Divider mb="sm" style={{ borderColor: "var(--gk-accent-primary)" }} />

      <Stack gap="sm">
        {step === "start" && (
          <>
            <GoogleSignInButton label="continue_with" fullWidth onSuccess={joinWithGoogle} onError={setError} />

            {SHOW_PHONE_JOIN && (
              <>
                <Divider label="or" labelPosition="center" />
                <TextInput
                  label="Your phone number"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                />
                <Button loading={sendingOtp} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void sendOtp()}>
                  Text Me a Code
                </Button>
              </>
            )}
          </>
        )}

        {step === "otp" && (
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">Enter the 6-digit code we sent to your phone</Text>
            <PinInput length={6} type="number" value={otp} onChange={setOtp} />
            <Button
              fullWidth
              size="xs"
              radius="xl"
              style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
              loading={verifying}
              disabled={otp.length !== 6}
              onClick={() => void verifyOtp()}
            >
              Confirm
            </Button>
          </Stack>
        )}

        {step === "name" && (
          <>
            <Text size="sm" c="dimmed">What's your name?</Text>
            <TextInput label="First name" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} required />
            <TextInput label="Last name" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} />
            <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void confirmName()}>
              Continue
            </Button>
          </>
        )}

        {step === "joining" && (
          <Center py="md"><Text size="sm" c="dimmed">Joining {communityName}…</Text></Center>
        )}

        {step === "done" && (
          <Stack gap="sm">
            <Text ta="center" c="green">You're in! Welcome to {communityName}.</Text>
            <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={handleClose}>Done</Button>
          </Stack>
        )}

        {error && <Alert color="red" variant="light">{error}</Alert>}
      </Stack>
    </Modal>
  );
}
