import { Alert, Button, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck, IconHammer } from "@tabler/icons-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { GoogleSignInButton } from "../GoogleSignInButton";
import { decodeGoogleJwt, joinWaitlist, type WaitlistUserType } from "../../api/waitlist";

interface WaitlistContextValue {
  openWaitlist: (userType?: WaitlistUserType) => void;
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function useWaitlist(): WaitlistContextValue {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used within WaitlistProvider");
  return ctx;
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [userType, setUserType] = useState<WaitlistUserType>("general");
  const [state, setState] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  const openWaitlist = useCallback((type: WaitlistUserType = "general") => {
    setUserType(type);
    setState("idle");
    setOpened(true);
  }, []);

  async function handleGoogleSuccess(idToken: string) {
    const { email, name, sub } = decodeGoogleJwt(idToken);
    if (!email) { setState("error"); return; }
    try {
      const result = await joinWaitlist({ email, name, google_sub: sub, user_type: userType });
      setState(result.already_registered ? "duplicate" : "success");
      setTimeout(() => setOpened(false), 2200);
    } catch {
      setState("error");
    }
  }

  const value = useMemo(() => ({ openWaitlist }), [openWaitlist]);

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Title order={4} style={{ fontFamily: "Manrope, sans-serif" }}>
            Join the waitlist
          </Title>
        }
        centered
        radius="lg"
        size="sm"
      >
        <Stack gap="md" pb="sm">
          {state === "idle" && (
            <>
              <Text size="sm" c="dimmed">
                Sign in with Google to reserve your spot. We're onboarding pros zipcode by
                zipcode — you'll hear from us when your area opens.
              </Text>
              <GoogleSignInButton
                label="signup_with"
                fullWidth
                onSuccess={handleGoogleSuccess}
                onError={() => setState("error")}
              />
            </>
          )}

          {(state === "success" || state === "duplicate") && (
            <Stack align="center" gap="sm" py="sm">
              <ThemeIcon size={56} radius="xl" color="green" variant="light">
                <IconCheck size={28} />
              </ThemeIcon>
              <Text fw={700} ta="center">
                {state === "duplicate" ? "You're already on the list!" : "You're on the list!"}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                We'll reach out when gigKraft.com opens in your area.
              </Text>
            </Stack>
          )}

          {state === "error" && (
            <Alert color="red" variant="light" icon={<IconHammer size={16} />}>
              Something went wrong — please try again.
            </Alert>
          )}

          {state === "idle" && (
            <Text size="xs" c="dimmed" ta="center">
              No spam. One email when your area goes live.
            </Text>
          )}

          {state === "error" && (
            <Button variant="subtle" size="sm" onClick={() => setState("idle")}>
              Try again
            </Button>
          )}
        </Stack>
      </Modal>
    </WaitlistContext.Provider>
  );
}
