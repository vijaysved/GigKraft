import { Alert, Box, Button, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";

import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { decodeGoogleJwt, joinWaitlist } from "../../api/waitlist";

const ROADMAP = [
  { icon: "🏗️", title: "General contractors", body: "Staff sites fast with subs proven on the exact trade." },
  { icon: "🏢", title: "Property management", body: "Route turnover & maintenance to vetted local pros." },
  { icon: "🛡️", title: "Insurance & warranty", body: "Close claims with auditable before/after proof." },
];

export function EnterprisePage() {
  const [state, setState] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  async function handleGoogle(idToken: string) {
    const { email, name, sub } = decodeGoogleJwt(idToken);
    if (!email) { setState("error"); return; }
    try {
      const r = await joinWaitlist({ email, name, google_sub: sub, user_type: "enterprise" });
      setState(r.already_registered ? "duplicate" : "success");
    } catch {
      setState("error");
    }
  }

  return (
    <Box>
      <Box className="mk-hero" style={{ minHeight: "calc(100vh - 66px - 200px)", display: "flex", alignItems: "center" }}>
        <Container size="xl" py={80}>
          <Box className="mk-hero-content">
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="lg">
                <Box style={{ display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "white" }}>
                  <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD200" }} />
                  Enterprise &amp; contractors · coming soon
                </Box>
                <Title order={1} style={{ fontSize: "clamp(34px,5vw,60px)", lineHeight: 1.02, letterSpacing: -1, color: "white" }}>
                  Sourcing proven trade talent at scale.
                </Title>
                <Text size="lg" maw={520} lh={1.55} style={{ color: "rgba(255,255,255,0.85)" }}>
                  We're building a dedicated product for general contractors, property managers, and insurance &amp; warranty providers — verified field talent, multi-zipcode coverage, and cross-channel dispatch, all backed by real proof of work.
                </Text>

                {state === "idle" && (
                  <Box mt={6}>
                    <Text size="sm" mb="sm" style={{ opacity: 0.85 }}>Sign in with Google to join the enterprise waitlist.</Text>
                    <GoogleSignInButton label="signup_with" onSuccess={handleGoogle} onError={() => setState("error")} />
                  </Box>
                )}

                {(state === "success" || state === "duplicate") && (
                  <Group gap="sm" p="md" style={{ background: "rgba(255,255,255,.1)", borderRadius: 12, maxWidth: 380 }}>
                    <ThemeIcon size={36} radius="xl" color="green" variant="filled">
                      <IconCheck size={18} />
                    </ThemeIcon>
                    <Text fw={700} style={{ color: "white" }}>
                      {state === "duplicate" ? "You're already on the list!" : "You're on the Enterprise list — we'll reach out when it opens."}
                    </Text>
                  </Group>
                )}

                {state === "error" && (
                  <Alert color="red" variant="light" maw={380}>
                    Something went wrong. <Button variant="subtle" size="xs" onClick={() => setState("idle")}>Try again</Button>
                  </Alert>
                )}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card withBorder radius="xl" shadow="lg" p={28} style={{ background: "var(--gk-bg-surface)", color: "var(--gk-bg-sidebar)" }}>
                <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mb="md" style={{ letterSpacing: 1.5 }}>What's on the roadmap</Text>
                <Stack gap="md">
                  {ROADMAP.map((r) => (
                    <Group key={r.title} gap="md" align="flex-start">
                      <Box style={{ width: 40, height: 40, borderRadius: 11, background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)", display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>{r.icon}</Box>
                      <Box>
                        <Text fw={700} size="md">{r.title}</Text>
                        <Text size="sm" c="dimmed" lh={1.5}>{r.body}</Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
