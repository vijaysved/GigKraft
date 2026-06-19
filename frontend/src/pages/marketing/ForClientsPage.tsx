import { Badge, Box, Button, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconMessageCircle, IconSearch, IconShieldCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useWaitlist } from "../../components/marketing/WaitlistModal";

const MK_ICON = { color: "var(--gk-accent-primary)", background: "rgba(255,107,26,0.1)", border: "1px solid rgba(255,107,26,0.15)", flexShrink: 0 as const };

const STEPS = [
  { num: "01", icon: <IconSearch size={16} />, title: "Browse the feed", body: "Scroll real before/after Krafts from pros in your zipcode. Filter by job type and distance." },
  { num: "02", icon: <IconShieldCheck size={16} />, title: "See the endorsement", body: "Every Kraft is endorsed by the homeowner who hired the pro. Invoice-verified pricing is coming soon." },
  { num: "03", icon: <IconMessageCircle size={16} />, title: "Request a quote", body: "Message the pro directly, or fire an emergency broadcast to every proven pro nearby at once." },
];

const RECS = [
  { label: "Water heaters", count: "23 verified" },
  { label: "Re-piping", count: "17 verified" },
  { label: "Tile & flooring", count: "no Krafts yet", empty: true },
];

export function ForClientsPage() {
  const { openWaitlist } = useWaitlist();
  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={64}>
          <Box className="mk-hero-content">
            <Badge variant="outline" radius="xl" size="sm" mb="md" style={{ letterSpacing: 1.5, borderColor: "rgba(255,255,255,0.5)", color: "white" }}>For homeowners</Badge>
            <Title order={1} maw={880} style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
              Hire on proof, not promises.
            </Title>
            <Text size="lg" mt="md" maw={640} lh={1.55} fw={500} style={{ color: "rgba(255,255,255,0.85)" }}>
              No more decoding fake five-star averages. See the actual before, the actual after, and the actual invoice — from a verified pro inside your own zip-code node.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Reading the Trust Graph */}
      <Container size="xl" py={80}>
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Reading the Trust Graph</Text>
              <Title order={2} style={{ fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
                A recommendation you can actually act on.
              </Title>
              <Text size="md" c="dimmed" lh={1.6}>
                Instead of a vague star average, each pro shows structured, binary recommendations tied to specific job types — "would hire again for tile work" — every one backed by a verified Kraft.
              </Text>
              <Button component={Link} to="/trust-graph" variant="default" radius="md" style={{ alignSelf: "flex-start" }}>
                How the graph works →
              </Button>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="lg" radius="xl" p="lg">
              <Group gap="sm" mb="md">
                <ThemeIcon size={42} radius="xl" style={MK_ICON}><IconShieldCheck size={20} /></ThemeIcon>
                <Box>
                  <Text fw={700} size="md">Marcus T.</Text>
                  <Text size="xs" c="dimmed" fw={600}>Licensed plumber · zip 85032</Text>
                </Box>
              </Group>
              <Stack gap="sm">
                {RECS.map((r) => (
                  <Group
                    key={r.label}
                    gap="sm"
                    p="sm"
                    style={{
                      border: "1px solid var(--gk-border)",
                      borderRadius: 10,
                      background: "var(--gk-bg-canvas)",
                      opacity: r.empty ? 0.5 : 1,
                    }}
                  >
                    <Box style={{ width: 26, height: 26, borderRadius: 7, background: r.empty ? "transparent" : "#CCFF00", border: "1px solid var(--gk-border)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, color: "#0A2540" }}>
                      {r.empty ? "—" : "✓"}
                    </Box>
                    <Text fw={700} size="sm">{r.label}</Text>
                    <Text size="xs" c="dimmed" fw={600} style={{ marginLeft: "auto" }}>{r.count}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Find a pro */}
      <Container size="xl" pb={80}>
        <Card withBorder shadow="md" radius="xl" p={48} style={{ background: "var(--gk-bg-canvas)" }}>
          <Box maw={640} mb={40}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Find a verified pro</Text>
            <Title order={2} mt={8} style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
              From emergency to verified pro in three taps.
            </Title>
          </Box>
          <Grid>
            {STEPS.map((s) => (
              <Grid.Col key={s.num} span={{ base: 12, md: 4 }}>
                <Card withBorder shadow="xs" radius="lg" p="md" h="100%">
                  <Text size="xs" fw={700} c="var(--gk-accent-primary)" style={{ letterSpacing: 1 }}>STEP {s.num}</Text>
                  <Group gap="xs" mt={6} mb={8} align="center">
                    <ThemeIcon size={28} radius="sm" style={MK_ICON}>{s.icon}</ThemeIcon>
                    <Title order={3}>{s.title}</Title>
                  </Group>
                  <Text size="sm" c="dimmed" lh={1.55}>{s.body}</Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* Emergency broadcast */}
      <Box className="mk-cta-band">
        <Container size="xl" py={72} pb={96}>
          <Box style={{ position: "relative", zIndex: 1 }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="xl">
              <Box maw={560}>
                <Text size="xs" fw={700} tt="uppercase" style={{ color: "rgba(255,255,255,0.65)", letterSpacing: 1.5 }}>Emergency broadcast · coming soon</Text>
                <Title order={2} mt={12} style={{ fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.06, letterSpacing: -0.5, color: "white" }}>
                  Burst pipe at 2am? Blast every proven pro nearby.
                </Title>
                <Text mt={14} size="md" lh={1.55} style={{ color: "rgba(255,255,255,0.82)" }}>
                  Soon, unrouted emergencies will go out over SMS &amp; WhatsApp to verified local pros — first to claim wins the job. We're building it now.
                </Text>
              </Box>
              <Button size="md" radius="xl" onClick={() => openWaitlist("general")} style={{ background: "rgba(0,0,0,0.7)", color: "white", border: "2px solid rgba(255,255,255,0.3)" }}>
                Join Waitlist
              </Button>
            </Group>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
