import { Box, Button, Card, Container, Grid, Group, Select, Stack, Text, Textarea, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconBrandWhatsapp, IconBuilding, IconCheck, IconCircleFilled, IconDeviceMobile, IconHardHat, IconHome, IconNews } from "@tabler/icons-react";
import { useState } from "react";

const DESKS = [
  { icon: <IconBuilding size={20} />, title: "Sales & Enterprise", desc: "Node coverage, demos, contracts.", email: "sales@gigkraft.com" },
  { icon: <IconHardHat size={20} />, title: "Pro Support", desc: "Krafts, billing, the vault.", email: "pros@gigkraft.com" },
  { icon: <IconHome size={20} />, title: "Client Support", desc: "Hiring, broadcasts, disputes.", email: "help@gigkraft.com" },
  { icon: <IconNews size={20} />, title: "Press & General", desc: "Media, partnerships, other.", email: "hello@gigkraft.com" },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>("Tradesperson / Pro");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={64}>
          <Box className="mk-hero-content">
            <Box style={{ display: "inline-block", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 18, color: "white" }}>
              Contact &amp; support
            </Box>
            <Title order={1} style={{ fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
              How can we route you?
            </Title>
            <Text size="lg" mt="md" maw={600} lh={1.55} style={{ color: "rgba(255,255,255,0.85)" }}>
              Pick a desk below or open a support ticket. Most requests get a human inside one business day.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Routing cards */}
      <Container size="xl" pt={64} pb={40}>
        <Grid>
          {DESKS.map((d) => (
            <Grid.Col key={d.title} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder shadow="xs" radius="lg" p="md" h="100%">
                <Stack gap={8}>
                  <ThemeIcon size={44} radius={12} color="orange" variant="light">{d.icon}</ThemeIcon>
                  <Title order={4} mt={4}>{d.title}</Title>
                  <Text size="sm" c="dimmed" lh={1.5}>{d.desc}</Text>
                  <Text size="sm" fw={600} ff="monospace" c="var(--gk-accent-primary)" mt={4}>{d.email}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Ticket form */}
      <Container size="xl" pb={88}>
        <Grid align="flex-start">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder shadow="lg" radius="xl" p={36}>
              <Title order={3} mb={6}>Open a support ticket</Title>
              <Text size="sm" c="dimmed" mb="lg">Tell us what's going on and we'll route it to the right desk.</Text>

              {submitted ? (
                <Group gap="md" p="lg" style={{ border: "1px solid var(--gk-border)", borderRadius: 12, background: "var(--gk-bg-canvas)" }}>
                  <ThemeIcon size={40} radius="xl" color="green" variant="light">
                    <IconCheck size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="md">Ticket received.</Text>
                    <Text size="sm" c="dimmed">We'll reach out within one business day.</Text>
                  </Box>
                </Group>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Name" required placeholder="Jordan Rivera" value={name} onChange={(e) => setName(e.target.value)} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Email" required type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </Grid.Col>
                    </Grid>
                    <Select
                      label="I am a…"
                      value={role}
                      onChange={setRole}
                      data={["Tradesperson / Pro", "Homeowner / Client", "Enterprise / Contractor", "Press / Other"]}
                    />
                    <Textarea
                      label="How can we help?"
                      required
                      rows={5}
                      placeholder="Describe your question or issue…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" variant="filled" size="md" radius="md" style={{ alignSelf: "flex-start" }}>
                      Submit ticket
                    </Button>
                  </Stack>
                </form>
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card withBorder radius="lg" p="lg" style={{ background: "var(--gk-bg-canvas)" }}>
                <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mb={10} style={{ letterSpacing: 1.5 }}>Talk to your node</Text>
                <Text size="sm" c="dimmed" lh={1.6}>Every region has a Community Node Manager on the ground. Once you join, they're your direct line for local supply and escalations.</Text>
              </Card>
              <Card withBorder radius="lg" p="lg" style={{ background: "var(--gk-bg-canvas)" }}>
                <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" mb={12} style={{ letterSpacing: 1.5 }}>Native channels</Text>
                <Stack gap="sm">
                  {[
                    { icon: <IconBrandWhatsapp size={16} />, label: "WhatsApp dispatch" },
                    { icon: <IconDeviceMobile size={16} />, label: "SMS broadcast" },
                    { icon: <IconCircleFilled size={10} style={{ color: "#6EF0A0" }} />, label: "System status: operational" },
                  ].map((c) => (
                    <Group key={c.label} gap="sm">
                      <ThemeIcon size={30} radius={8} color="orange" variant="light">{c.icon}</ThemeIcon>
                      <Text size="sm" fw={600}>{c.label}</Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
