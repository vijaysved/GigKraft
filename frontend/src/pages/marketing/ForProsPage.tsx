import { Badge, Box, Button, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCamera, IconCameraCheck, IconFileExport, IconHeartHandshake, IconId, IconMapPin, IconReceipt } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { ProfileComparisonSection } from "../../components/marketing/ProfileComparisonSection";

const SHIFT_BAD = [
  "Pay $30–80 per shared lead, bid against 5 others",
  "Reviews locked to the platform — leave and lose them",
  "Anonymous stars no client can verify",
  "Your client list belongs to them, not you",
];
const SHIFT_GOOD = [
  "Flat $24.99/mo — build your reputation",
  "Every Kraft is yours to export and re-host",
  "Verified before/after, endorsed by the homeowner",
  "You own the client relationship outright",
];

const HOW = [
  { num: "01", icon: <IconCamera size={16} />, title: "Optional \"before\"", body: "Add the rough starting state if you have it. Skippable — never a blocker.", bold: false },
  { num: "02", icon: <IconCameraCheck size={16} />, title: "Mandatory \"after\"", body: "The finished result is required. No after image, no Kraft — that's the rule.", bold: true },
  { num: "03", icon: <IconReceipt size={16} />, title: "Invoice confirm — soon", body: "Coming soon: the job cost will be matched against a confirmed invoice for hard, auditable proof.", bold: false },
  { num: "04", icon: <IconMapPin size={16} />, title: "Pin to zipcode", body: "Published to your zipcode so nearby homeowners find proven, local work first.", bold: false },
];

const OWNERSHIP = [
  { icon: <IconId size={22} />, title: "Your pro profile", body: "A clean profile page that collects your verified Krafts and homeowner endorsements in one place." },
  { icon: <IconFileExport size={22} />, title: "Full export", body: "Download every Kraft, photo and invoice record as portable files — no lock-in, ever." },
  { icon: <IconHeartHandshake size={22} />, title: "Own the client", body: "Repeat customers contact you directly. We route the first job; the relationship is yours." },
];

const ROLE_HOME: Record<string, string> = {
  pro: "/pro/leads",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

export function ForProsPage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [ctaError, setCtaError] = useState<string | null>(null);

  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={64}>
          <Box className="mk-hero-content">
            <Badge variant="outline" radius="xl" size="sm" mb="md" style={{ letterSpacing: 1.5, borderColor: "rgba(255,255,255,0.5)", color: "white" }}>For tradespeople</Badge>
            <Title order={1} maw={880} style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
              Stop renting leads. Start owning a reputation.
            </Title>
            <Text size="lg" mt="md" maw={640} lh={1.55} fw={500} style={{ color: "rgba(255,255,255,0.85)" }}>
              Most platforms charge you per lead and keep your reviews hostage. gigKraft.com flips it: every job becomes verified proof in a portfolio that's portable, searchable, and yours forever.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* The shift */}
      <Container size="xl" py={80}>
        <Box maw={640} mb={40}>
          <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>The shift</Text>
          <Title order={2} mt={8} style={{ fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
            Transactional lead-gen vs. a portable reputation.
          </Title>
        </Box>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg" p={28} style={{ opacity: 0.85, borderStyle: "dashed" }} h="100%">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: 1 }}>The lead-gen treadmill</Text>
              <Stack gap="sm">
                {SHIFT_BAD.map((t) => (
                  <Group key={t} gap="xs" align="flex-start">
                    <Text c="red" fw={700}>✕</Text>
                    <Text size="sm" c="dimmed" fw={500}>{t}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="md" radius="lg" p={28} h="100%">
              <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mb="md" style={{ letterSpacing: 1 }}>The gigKraft.com portfolio</Text>
              <Stack gap="sm">
                {SHIFT_GOOD.map((t) => (
                  <Group key={t} gap="xs" align="flex-start">
                    <Text c="var(--gk-accent-primary)" fw={700}>✓</Text>
                    <Text size="sm" fw={600}>{t}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Portfolio mechanics */}
      <Container size="xl" pb={80}>
        <Card withBorder shadow="md" radius="xl" p={48} style={{ background: "var(--gk-bg-canvas)" }}>
          <Box maw={640} mb={40}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>How a Kraft is built</Text>
            <Title order={2} mt={8} style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
              The verification guardrail, step by step.
            </Title>
          </Box>
          <Grid>
            {HOW.map((h) => (
              <Grid.Col key={h.num} span={{ base: 12, sm: 6, md: 3 }}>
                <Card
                  withBorder
                  radius="lg"
                  p="md"
                  h="100%"
                  style={h.bold ? { borderColor: "var(--gk-accent-primary)", borderStyle: "dashed", borderWidth: 2 } : {}}
                >
                  <Text size="xs" fw={700} c="var(--gk-accent-primary)">{h.num}</Text>
                  <Group gap="xs" mt={6} mb={8} align="center">
                    <ThemeIcon size={28} radius="sm" color="orange" variant="light">{h.icon}</ThemeIcon>
                    <Title order={4}>{h.title}</Title>
                  </Group>
                  <Text size="sm" c="dimmed" lh={1.5}>{h.body}</Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* Data ownership */}
      <Container size="xl" pb={80}>
        <Box maw={640} mb={40}>
          <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Your data, your rights</Text>
          <Title order={2} mt={8} style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
            Built so you can walk away with everything.
          </Title>
        </Box>
        <Grid>
          {OWNERSHIP.map((o) => (
            <Grid.Col key={o.title} span={{ base: 12, md: 4 }}>
              <Card withBorder shadow="xs" radius="lg" p="md" h="100%">
                <ThemeIcon size={44} radius={12} mb="sm" color="orange" variant="light">{o.icon}</ThemeIcon>
                <Title order={3} mb={8}>{o.title}</Title>
                <Text size="sm" c="dimmed" lh={1.55}>{o.body}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Profile comparison */}
      <ProfileComparisonSection />

      {/* CTA */}
      <Box className="mk-cta-band">
        <Container size="xl" py={72} pb={96}>
          <Box style={{ position: "relative", zIndex: 1 }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="xl">
              <Box maw={560}>
                <Title order={2} style={{ fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.06, letterSpacing: -0.5, color: "white" }}>
                  Build your profile. Own your reputation.
                </Title>
                <Text mt={14} size="md" style={{ color: "rgba(255,255,255,0.82)" }}>No bidding, no per-lead fees, no rake. See exactly what's included.</Text>
              </Box>
              <Group gap="sm" wrap="wrap" align="flex-start">
                <Button component={Link} to="/pricing" size="md" radius="xl" style={{ background: "rgba(0,0,0,0.7)", color: "white", border: "2px solid rgba(255,255,255,0.3)" }}>View pricing</Button>
                {user ? (
                  <Button
                    component={Link}
                    to={ROLE_HOME[user.role] ?? "/pro/leads"}
                    size="md"
                    radius="xl"
                    style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.5)" }}
                  >
                    Go to dashboard
                  </Button>
                ) : (
                  <Stack gap={6} align="flex-start">
                    <GoogleSignInButton
                      label="signup_with"
                      onSuccess={async (idToken) => {
                        setCtaError(null);
                        try {
                          const { created } = await loginWithGoogle(idToken, "pro");
                          navigate(created ? "/pro/onboarding" : "/pro/leads");
                        } catch (err) {
                          setCtaError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
                        }
                      }}
                      onError={setCtaError}
                    />
                    {ctaError && <Text size="xs" style={{ color: "rgba(255,255,255,0.9)" }}>{ctaError}</Text>}
                  </Stack>
                )}
              </Group>
            </Group>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
