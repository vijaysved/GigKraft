import { Box, Button, Card, Container, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { GkLogo } from "../../brand/GkLogo";

const MACRO = [
  { val: "2.1M", title: "The skills deficit", body: "Unfilled skilled-trade roles in the U.S. alone — and the gap widens as a generation retires." },
  { val: "61%", title: "Visual workforce", body: "Of next-gen tradespeople already build their name through visual proof of work, not paper résumés." },
  { val: "$680B", title: "Smart infrastructure", body: "Flowing into certified retrofits and connected-home upgrades through 2030 — all needing verified pros." },
];

const TEAM = [
  { initial: "S", name: "Satya", role: "Founder & CEO", bio: "Satya spent a decade building local-services marketplaces before starting gigKraft.com. After watching skilled pros lose their reputation every time they switched platforms, he set out to make trust portable — and proof, not stars, the unit of credibility." },
  { initial: "V", name: "Vikram", role: "Co-founder & CTO", bio: "Vikram leads engineering. A former infrastructure lead on high-volume dispatch systems, he architected gigKraft.com's verification pipeline and the cross-channel automation that will route emergencies over SMS and WhatsApp at city scale." },
  { initial: "A", name: "Agents", role: "Head of Marketing", bio: "Agents runs growth and brand. With a background scaling category-defining consumer marketplaces, they translate gigKraft.com's proof-over-prose thesis into a voice that resonates with working pros and the homeowners who hire them." },
];

export function AboutPage() {
  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={80}>
          <Box className="mk-hero-content">
            <Stack align="center" ta="center" maw={900} mx="auto" gap="lg">
              <Box style={{ display: "inline-block", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "white" }}>About gigKraft.com</Box>
              <Title order={1} style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
                We're building the trust layer for the skilled trades.
              </Title>
              <Text size="lg" maw={620} lh={1.6} style={{ color: "rgba(255,255,255,0.85)" }}>
                gigKraft.com started with one conviction: the people who actually fix the physical world deserve a reputation system built on proof, not popularity.
              </Text>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Logo / Story */}
      <Container size="xl" py={80}>
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box style={{ border: "2px solid var(--gk-border)", borderRadius: 24, overflow: "hidden", background: "var(--gk-bg-canvas)", padding: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GkLogo height={80} />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Why we exist</Text>
              <Title order={2} style={{ fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.1, letterSpacing: -0.5 }}>Field proof beats star ratings.</Title>
              <Text size="md" c="dimmed" lh={1.7}>
                Legacy marketplaces turned trades into lead-renters and reduced craftsmanship to anonymous star averages. We threw that out. Every gigKraft.com pro is verified by the work itself — a real before/after backed by a confirmed invoice, pinned to a real place.
              </Text>
              <Text size="md" c="dimmed" lh={1.7}>
                We're hyper-local by design — your reputation is tied to the zipcodes you actually work in, with a regional community manager who knows the area. Because trust is local.
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Macro trends */}
      <Box className="mk-dark-section">
        <Container size="xl" py={76}>
          <Box maw={680} mb={44}>
            <Text size="xs" fw={700} tt="uppercase" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1.5 }}>Macro trends</Text>
            <Title order={2} mt={10} style={{ fontSize: "clamp(26px,3.4vw,40px)", lineHeight: 1.08, letterSpacing: -0.5, color: "white" }}>
              The tailwinds we're built on.
            </Title>
          </Box>
          <Grid>
            {MACRO.map((m) => (
              <Grid.Col key={m.val} span={{ base: 12, md: 4 }}>
                <Box style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 18, padding: 28 }}>
                  <Title style={{ fontSize: 46, lineHeight: 1, color: "white" }}>{m.val}</Title>
                  <Text fw={700} size="md" mt={14} mb={6} style={{ color: "white" }}>{m.title}</Text>
                  <Text size="sm" fw={500} lh={1.6} style={{ color: "rgba(255,255,255,0.72)" }}>{m.body}</Text>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team */}
      <Container size="xl" py={84}>
        <Box maw={640} mb={44}>
          <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>The team</Text>
          <Title order={2} mt={10} style={{ fontSize: "clamp(26px,3.2vw,40px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
            Built by people who know the trades and the tech.
          </Title>
        </Box>
        <Grid>
          {TEAM.map((t) => (
            <Grid.Col key={t.name} span={{ base: 12, md: 4 }}>
              <Card withBorder shadow="md" radius="xl" p={28} h="100%">
                <Stack gap="md">
                  <Box style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gk-bg-sidebar)", color: "var(--gk-text-sidebar)", border: "2px solid var(--gk-border)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 24 }}>
                    {t.initial}
                  </Box>
                  <Box>
                    <Title order={3}>{t.name}</Title>
                    <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mt={3} style={{ letterSpacing: 0.5 }}>{t.role}</Text>
                  </Box>
                  <Text size="sm" c="dimmed" lh={1.6}>{t.bio}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Container size="xl" pb={88}>
        <Stack align="center" ta="center" gap="lg" maw={760} mx="auto">
          <Title order={2} style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.05, letterSpacing: -0.8 }}>Come build it with us.</Title>
          <Text size="lg" c="dimmed" lh={1.6}>We're hiring across engineering, design, and regional operations.</Text>
          <Group gap="sm" wrap="wrap" justify="center">
            <Button component={Link} to="/careers" variant="filled" size="md" radius="md">See open roles</Button>
            <Button component={Link} to="/contact" variant="default" size="md" radius="md">Contact us</Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}
