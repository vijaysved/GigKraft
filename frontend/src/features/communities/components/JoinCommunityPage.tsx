import { Alert, Box, Button, Center, Divider, Loader, PinInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { GoogleSignInButton } from "../../../components/GoogleSignInButton";
import { communityFetch } from "../hooks/useCommunity";

interface Preview {
  name: string;
  phone: string;
  email: string;
  status: string;
  community_name: string;
  community_slug: string;
}

export function JoinCommunityPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!slug || !token) return;
    communityFetch(`/api/communities/${slug}/join/${token}`)
      .then(async (r) => {
        if (!r.ok) { const d = await r.json() as { detail?: string }; throw new Error(d.detail ?? "Invite not found."); }
        return r.json() as Promise<Preview>;
      })
      .then((data) => setPreview(data))
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [slug, token]);

  async function sendOtp() {
    setSendingOtp(true);
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/join/${token}/send-otp`, { method: "POST" });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Could not send code.");
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    setVerifying(true);
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/join/${token}`, {
        method: "POST",
        body: JSON.stringify({ otp_code: otp }),
      });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Invalid code.");
      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setVerifying(false);
    }
  }

  async function joinWithGoogle(idToken: string) {
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/join/${token}`, {
        method: "POST",
        body: JSON.stringify({ google_id_token: idToken }),
      });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Google sign-in failed.");
      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (loading) return <Center h="60vh"><Loader /></Center>;

  if (loadError || !preview) {
    return (
      <Center h="60vh"><Alert color="red" variant="light">{loadError ?? "Invite not found."}</Alert></Center>
    );
  }

  return (
    <Box py="xl">
      <Center>
        <Stack gap="md" w="100%" maw={420} px="md">
          <Title order={3} ta="center">Join {preview.community_name}</Title>

          {joined || preview.status === "joined" ? (
            <Text ta="center" c="green">You're in! Welcome to {preview.community_name}.</Text>
          ) : (
            <>
              <TextInput label="Your name" value={preview.name} disabled />

              {preview.phone && (
                <Stack gap="xs">
                  {!otpSent ? (
                    <Button loading={sendingOtp} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void sendOtp()}>
                      Text Me a Code
                    </Button>
                  ) : (
                    <Stack gap="xs" align="center">
                      <Text size="sm" c="dimmed">Enter the 6-digit code we sent to your phone</Text>
                      <PinInput length={6} type="number" value={otp} onChange={setOtp} />
                      <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
                        loading={verifying} disabled={otp.length !== 6} onClick={() => void verifyOtp()}>
                        Confirm
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}

              <Divider label="or" labelPosition="center" />

              <GoogleSignInButton label="continue_with" fullWidth onSuccess={joinWithGoogle} onError={setError} />

              {error && <Alert color="red" variant="light">{error}</Alert>}
            </>
          )}
        </Stack>
      </Center>
    </Box>
  );
}
