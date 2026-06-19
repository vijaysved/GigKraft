import { Box, Button, Card, Container, Grid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCircleCheck, IconNetwork, IconReceipt2 } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const MK_ICON = { color: "var(--gk-accent-primary)", background: "rgba(255,107,26,0.1)", border: "1px solid rgba(255,107,26,0.15)", flexShrink: 0 as const };

const FAILURES = [
  { num: "FAILURE 01", title: "Unverifiable", body: "No proof a review came from a real, paying customer — or that the job ever happened at all." },
  { num: "FAILURE 02", title: "Pay-to-rank", body: "Placement is auctioned. The pro at the top paid the most for the slot — not earned it on merit." },
  { num: "FAILURE 03", title: "Lossy", body: "One number can't say a pro is great at re-piping but new to tile. The signal you need is gone." },
];

const ANSWERS = [
  { icon: <IconCircleCheck size={22} />, title: "Binary, not blurred", body: "Recommend or don't. No half-stars to interpret, no review essays to wade through." },
  { icon: <IconReceipt2 size={22} />, title: "Endorsement-backed", body: "Every recommendation is welded to a real homeowner endorsement. Invoice verification is coming soon." },
  { icon: <IconNetwork size={22} />, title: "Graph, not average", body: "Strength is read per job type, per zipcode — so you see exactly what a pro is proven at." },
];

export function TrustGraphPage() {
  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={84}>
          <Box className="mk-hero-content">
            <Stack align="center" ta="center" maw={900} mx="auto" gap="lg">
              <Box style={{ display: "inline-block", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "white" }}>Manifesto</Box>
              <Title order={1} style={{ fontSize: "clamp(36px,5.2vw,64px)", lineHeight: 1.02, letterSpacing: -1.2, color: "white" }}>
                The five-star rating is broken. So we threw it out.
              </Title>
              <Text size="xl" maw={660} lh={1.55} style={{ color: "rgba(255,255,255,0.85)" }}>
                Anonymous star averages are a measurement failure dressed up as trust. Here's why gigKraft.com replaced them with a structured graph of verified work.
              </Text>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* The problem */}
      <Container size="xl" py={80}>
        <Box maw={760} mb={48} mx="auto">
          <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>The problem</Text>
          <Title order={2} mt={10} mb={18} style={{ fontSize: "clamp(26px,3.4vw,40px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
            Why Yelp and Angi can't tell you who's good.
          </Title>
          <Text size="md" c="dimmed" lh={1.7}>
            A 4.7-star average across 200 anonymous, unverifiable reviews is statistical noise. It compresses every dimension of a complex trade job — quality, price, timeliness, cleanup — into a single number that anyone can game and no one can audit. It is the wrong instrument for the job.
          </Text>
        </Box>
        <Grid>
          {FAILURES.map((f) => (
            <Grid.Col key={f.num} span={{ base: 12, md: 4 }}>
              <Card withBorder shadow="xs" radius="lg" p="lg" h="100%">
                <Text size="xs" fw={700} c="var(--gk-accent-primary)" style={{ letterSpacing: 1 }}>{f.num}</Text>
                <Title order={3} mt={8} mb={8}>{f.title}</Title>
                <Text size="sm" c="dimmed" lh={1.6}>{f.body}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* The answer */}
      <Container size="xl" pb={80}>
        <Card withBorder shadow="md" radius="xl" p={52} style={{ background: "var(--gk-bg-canvas)" }}>
          <Box maw={680} mb={36}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>The answer</Text>
            <Title order={2} mt={10} mb={14} style={{ fontSize: "clamp(26px,3.4vw,40px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
              Structured, binary, verified recommendations.
            </Title>
            <Text size="md" c="dimmed" lh={1.7}>
              gigKraft.com asks one honest question per real job: <em>would you hire this pro again, for this kind of work?</em> A yes attaches to a verified Kraft — a before/after endorsed by the homeowner (invoice verification coming soon) — and slots into a graph organized by job type and zipcode.
            </Text>
          </Box>
          <Grid>
            {ANSWERS.map((a) => (
              <Grid.Col key={a.title} span={{ base: 12, md: 4 }}>
                <Card withBorder shadow="xs" radius="lg" p="md" h="100%">
                  <ThemeIcon size={44} radius={12} mb="sm" style={MK_ICON}>{a.icon}</ThemeIcon>
                  <Title order={4} mb={8}>{a.title}</Title>
                  <Text size="sm" c="dimmed" lh={1.55}>{a.body}</Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* Closing */}
      <Container size="xl" pb={96}>
        <Stack align="center" ta="center" gap="lg" maw={760} mx="auto">
          <Title order={2} style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: -0.8 }}>
            Trust should be earned in the field and read at a glance.
          </Title>
          <Text size="lg" c="dimmed" lh={1.6}>That's the whole thesis. Browse the proof, not the prose.</Text>
          <Button component={Link} to="/for-homeowners" variant="filled" size="md" radius="md">
            See it as a homeowner →
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
