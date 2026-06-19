import { Badge, Box, Button, Card, Container, Divider, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBolt, IconBriefcase, IconCamera, IconCoin, IconMapPin, IconShieldCheck, IconThumbUp, IconUserCircle } from "@tabler/icons-react";
import { Link } from "react-router-dom";

import { HeroSlider } from "../../components/marketing/HeroSlider";
import { useWaitlist } from "../../components/marketing/WaitlistModal";

const MK_ICON = { color: "var(--gk-accent-primary)", background: "rgba(255,107,26,0.1)", border: "1px solid rgba(255,107,26,0.15)", flexShrink: 0 as const };

const VALUE_PROPS = [
  { icon: <IconBriefcase size={22} />, title: "Portfolio you own", body: "Your Krafts and client data are yours. Export them, point a custom domain at them, take them anywhere." },
  { icon: <IconShieldCheck size={22} />, title: "Proof, not prose", body: "A mandatory \"after\" image plus a real endorsement from the homeowner who hired you. Invoice verification coming soon." },
  { icon: <IconMapPin size={22} />, title: "Know your zipcode standing", body: "See how your Krafts stack up against other pros in your zipcode — and where you can climb." },
  { icon: <IconCoin size={22} />, title: "One flat rate", body: "$24.99/mo or $249.99/yr to publish case studies and build your reputation. No per-lead bidding, no rake." },
];

const STEPS = [
  { num: "01", icon: <IconUserCircle size={16} />, title: "Create your profile", body: "Set up your pro profile and pin it to the zipcodes where you work." },
  { num: "02", icon: <IconCamera size={16} />, title: "Add your Krafts", body: "Upload before/after Krafts of finished jobs. The \"after\" image is mandatory — that's the proof." },
  { num: "03", icon: <IconThumbUp size={16} />, title: "Get recommendations", body: "The homeowner who hired you endorses the Kraft, building your verified reputation in the zipcode." },
];

const STATS = [
  { val: "8,400+", label: "verified Krafts" },
  { val: "3,100+", label: "pros on gigKraft.com" },
  { val: "$2.4M", label: "in Kraft value" },
];

const MACRO = [
  { val: "2.1M", body: "unfilled skilled-trade jobs — a deficit widening every year as boomers retire." },
  { val: "61%", body: "of new tradespeople already market their work visually — proof-first is how they're found." },
  { val: "$680B", body: "in smart-infrastructure and certified retrofits flowing into homes through 2030." },
];

export function HomePage() {
  const { openWaitlist } = useWaitlist();

  return (
    <Box>
      {/* ── HERO ── */}
      <Box className="mk-hero">
        <Container size="xl" py={72}>
          <Box className="mk-hero-content">
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Badge variant="outline" radius="xl" size="sm" style={{ alignSelf: "flex-start", letterSpacing: 1.5, textTransform: "uppercase", borderColor: "rgba(255,255,255,0.5)", color: "white" }}>
                  Built for the trades
                </Badge>
                <Title order={1} style={{ fontSize: "clamp(38px,5vw,62px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
                  Own the proof.<br />Own the work.
                </Title>
                <Text size="lg" lh={1.55} maw={520} fw={500} style={{ color: "rgba(255,255,255,0.85)" }}>
                  gigKraft.com turns every finished job into a <Text span fw={700} style={{ color: "white" }}>verified before/after Kraft</Text> — endorsed by the real people who had the work done. Own a portable reputation and see exactly how you stack up in your zipcode. Publish your portfolio for <Text span fw={700} style={{ color: "white" }}>$24.99/mo</Text>.
                </Text>
                <Group gap="sm" mt={4} wrap="wrap">
                  <Button component={Link} to="/pricing" size="md" radius="md" style={{ background: "rgba(0,0,0,0.75)", color: "white", border: "2px solid rgba(255,255,255,0.3)" }}>
                    Build Your Profile
                  </Button>
                  <Button component={Link} to="/for-pros" size="md" radius="md" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>
                    See how it works →
                  </Button>
                </Group>
                <Group gap={28} mt={8} wrap="wrap">
                  {STATS.map((s, i) => (
                    <Box key={s.val}>
                      <Text fw={700} size="xl" style={{ fontFamily: "Manrope, sans-serif", color: "white" }}>{s.val}</Text>
                      <Text size="xs" fw={600} style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</Text>
                      {i < STATS.length - 1 && <Divider orientation="vertical" style={{ display: "none" }} />}
                    </Box>
                  ))}
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder shadow="md" radius="xl" p="sm">
                <Group justify="space-between" px={6} pb="sm">
                  <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>A Verified Kraft</Text>
                  <Text size="xs" fw={600} c="dimmed" ff="monospace">#KR-2261 · zip 85032</Text>
                </Group>
                <HeroSlider />
                <Group justify="space-between" pt="sm" px={6}>
                  <Group gap="xs">
                    <ThemeIcon size={30} radius="xl" style={{ color: "var(--gk-accent-primary)", background: "rgba(255,107,26,0.1)", border: "1px solid rgba(255,107,26,0.15)", flexShrink: 0 }}><IconUserCircle size={16} /></ThemeIcon>
                    <Box>
                      <Text size="sm" fw={700} lh={1.1}>Marcus T.</Text>
                      <Text size="xs" c="dimmed" fw={600}>Licensed plumber · 1.4 mi away</Text>
                    </Box>
                  </Group>
                  <Text size="xs" c="dimmed" fw={600}>drag to compare ⇆</Text>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
          </Box>
        </Container>
      </Box>

      {/* ── PROOF BAR ── */}
      <Box className="mk-proof-bar">
        <Container size="xl" py="sm">
          <Group justify="center" gap="sm" wrap="wrap">
            <Group gap="xs" align="center">
              <IconBolt size={16} style={{ color: "white" }} />
              <Text fw={700} style={{ color: "white" }}>Coming soon</Text>
            </Group>
            <Text style={{ color: "rgba(255,255,255,0.75)" }}>Invoice-verified Krafts and emergency SMS &amp; WhatsApp broadcast are on the way.</Text>
          </Group>
        </Container>
      </Box>

      {/* ── VALUE PROPS ── */}
      <Container size="xl" py={88}>
        <Stack gap="xl">
          <Box maw={680}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Why gigKraft.com</Text>
            <Title order={2} mt={8} style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
              A reputation that travels with you — not the platform.
            </Title>
          </Box>
          <Grid>
            {VALUE_PROPS.map((p) => (
              <Grid.Col key={p.title} span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder shadow="xs" radius="lg" h="100%" p="md">
                  <Stack gap="sm">
                    <ThemeIcon size={44} radius={12} style={MK_ICON}>{p.icon}</ThemeIcon>
                    <Text fw={700} size="md">{p.title}</Text>
                    <Text size="sm" c="dimmed" lh={1.55}>{p.body}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* ── HOW IT WORKS ── */}
      <Container size="xl" pb={88}>
        <Card withBorder shadow="md" radius="xl" p={48} style={{ background: "var(--gk-bg-canvas)" }}>
          <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="md">
            <Box maw={560}>
              <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Three steps to your first lead</Text>
              <Title order={2} mt={8} style={{ fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
                Finish the job. Bank the proof.
              </Title>
            </Box>
            <Button component={Link} to="/for-pros" variant="default" radius="md">Full pro guide →</Button>
          </Group>
          <Grid>
            {STEPS.map((s) => (
              <Grid.Col key={s.num} span={{ base: 12, md: 4 }}>
                <Card withBorder shadow="xs" radius="lg" p="md">
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

      {/* ── TRUST GRAPH TEASER ── */}
      <Container size="xl" pb={88}>
        <Grid align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="md" radius="xl" p={40} h="100%">
              <Stack gap="md" justify="center" h="100%">
                <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>The Trust Graph</Text>
                <Title order={2} style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.08, letterSpacing: -0.5 }}>
                  Five anonymous stars tell you nothing.
                </Title>
                <Text size="md" c="dimmed" lh={1.6}>
                  Yelp and Angi rank prose and paid placement. gigKraft.com replaces the star average with structured, binary project recommendations tied to verified work — a graph you can actually read.
                </Text>
                <Button component={Link} to="/trust-graph" variant="filled" radius="md" style={{ alignSelf: "flex-start" }}>
                  Read the manifesto →
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md" h="100%">
              <Card withBorder radius="lg" p="md" style={{ opacity: 0.75 }}>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={8}>The old way</Text>
                <Text size="xl" style={{ letterSpacing: 3, color: "#C77800" }}>★★★★<span style={{ opacity: 0.3 }}>★</span></Text>
                <Text size="sm" c="dimmed" fw={600} mt={6}>"Great guy, highly recommend!!" — anonymous, 3 years ago, unverified.</Text>
              </Card>
              <Card withBorder shadow="md" radius="lg" p="md" style={{ flex: 1 }}>
                <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mb={10}>The gigKraft.com way</Text>
                <Group gap="sm" mb={8}>
                  <Box style={{ width: 28, height: 28, borderRadius: 8, background: "#CCFF00", border: "1px solid var(--gk-border)", display: "grid", placeItems: "center", fontWeight: 800, color: "#0A2540" }}>✓</Box>
                  <Text fw={700} size="md">Would hire again for water-heater work</Text>
                </Group>
                <Text size="sm" c="dimmed" fw={600}>Verified Kraft · endorsed by homeowner · 1.4 mi · zip 85032 · 11 days ago</Text>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* ── MACRO TRENDS ── */}
      <Box className="mk-dark-section">
        <Container size="xl" py={72}>
          <Box maw={680} mb={44}>
            <Text size="xs" fw={700} tt="uppercase" style={{ color: "rgba(255,255,255,0.65)", letterSpacing: 1.5 }}>The macro tailwind</Text>
            <Title order={2} mt={10} style={{ fontSize: "clamp(28px,3.4vw,40px)", lineHeight: 1.08, letterSpacing: -0.5, color: "white" }}>
              The trades are the next great visual workforce.
            </Title>
          </Box>
          <Grid>
            {MACRO.map((m) => (
              <Grid.Col key={m.val} span={{ base: 12, md: 4 }}>
                <Box style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 18, padding: 26 }}>
                  <Title style={{ fontSize: 46, lineHeight: 1, color: "white" }}>{m.val}</Title>
                  <Text size="sm" fw={600} mt={10} lh={1.5} style={{ color: "rgba(255,255,255,0.75)" }}>{m.body}</Text>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FINAL CTA ── */}
      <Box className="mk-cta-band">
        <Container size="xl" py={88}>
          <Box style={{ position: "relative", zIndex: 1 }}>
            <Stack align="center" gap="lg" maw={800} mx="auto" ta="center">
              <Title order={2} style={{ fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
                Build your profile. Publish your first Kraft.
              </Title>
              <Text size="lg" maw={520} lh={1.55} style={{ color: "rgba(255,255,255,0.85)" }}>
                Join the early-access list for your area. We're onboarding proven local pros zipcode by zipcode.
              </Text>
              <Button size="lg" radius="xl" onClick={() => openWaitlist("pro")} mt={6} style={{ background: "rgba(0,0,0,0.75)", color: "white", border: "2px solid rgba(255,255,255,0.35)", paddingLeft: 40, paddingRight: 40 }}>
                Join the Waitlist
              </Button>
              <Text size="xs" fw={600} style={{ color: "rgba(255,255,255,0.6)" }}>$24.99/mo or $249.99/yr · cancel anytime · no per-lead fees.</Text>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
