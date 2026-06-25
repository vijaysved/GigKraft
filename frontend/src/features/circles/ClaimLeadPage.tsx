import { Alert, Button, Center, Loader, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { useAuth } from "../../auth/AuthContext";
import { getAccessToken } from "../../api/tokens";

type ClaimState = "idle" | "claiming" | "claimed" | "no_pro_profile" | "error";

function authHeaders() {
  const token = getAccessToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function ClaimLeadPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<ClaimState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !leadId) return;

    setState("claiming");
    fetch(`${API_BASE_URL}/api/circles/claim-lead/${leadId}`, {
      method: "POST",
      headers: authHeaders(),
    })
      .then(async (r) => {
        const body = (await r.json()) as { lead_id?: number; detail?: string };
        if (r.ok) {
          setState("claimed");
          setTimeout(() => navigate("/pro/inbox", { replace: true }), 1800);
        } else if (body.detail === "no_pro_profile") {
          setState("no_pro_profile");
          // Save leadId so the pro inbox can surface it after upgrade
          sessionStorage.setItem("gk_claim_lead", leadId);
        } else {
          setErrorMsg(body.detail ?? "Something went wrong.");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error. Please try again.");
        setState("error");
      });
  }, [status, leadId, navigate]);

  // Not yet authenticated — show register / login CTAs
  if (status === "loading") {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (status !== "authenticated") {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md" maw={480} ta="center" p="xl">
          <Title order={3}>You have a job waiting on Gigkraft</Title>
          <Text c="dimmed">
            A neighbor found you through someone who recommended you. Create a free
            account to view the job details and claim this intro.
          </Text>
          <Button
            size="md"
            style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
            onClick={() => {
              sessionStorage.setItem("gk_claim_lead", leadId!);
              navigate(`/register?claim=${leadId}`);
            }}
          >
            Create account & view job
          </Button>
          <Text size="xs" c="dimmed">
            Already have an account?{" "}
            <Text
              span
              c="blue"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/login?returnTo=/claim/${leadId}`)}
            >
              Sign in
            </Text>
          </Text>
        </Stack>
      </Center>
    );
  }

  // Authenticated — show result of the auto-claim attempt
  return (
    <Center h="100vh">
      <Stack align="center" gap="md" maw={480} ta="center" p="xl">
        {state === "claiming" && (
          <>
            <Loader />
            <Text c="dimmed">Linking your job…</Text>
          </>
        )}

        {state === "claimed" && (
          <>
            <Title order={3}>Job claimed!</Title>
            <Text c="dimmed">Redirecting you to your inbox…</Text>
          </>
        )}

        {state === "no_pro_profile" && (
          <>
            <Title order={3}>Almost there!</Title>
            <Text c="dimmed">
              Your job intro is waiting. Complete your pro profile to unlock it.
            </Text>
            <Button onClick={() => navigate("/pro/onboarding")}>
              Complete your pro profile
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <Alert color="red" variant="light" w="100%">
              {errorMsg}
            </Alert>
            <Text size="sm" c="dimmed">
              Signed in as{" "}
              <strong>{user?.email ?? user?.phone ?? "unknown"}</strong>.
              Make sure this matches the email your client used when they added you.
            </Text>
            <Button variant="subtle" onClick={() => navigate("/pro/inbox")}>
              Go to inbox
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
}
