import { Badge, Box, Button, Card, Container, Grid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBolt, IconHandshake, IconMapPin, IconTool } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const VALUES = [
  { icon: <IconTool size={22} />, title: "Proof over polish", body: "We judge work by what it does in the field, not how it pitches." },
  { icon: <IconMapPin size={22} />, title: "Local by default", body: "Decisions live close to the nodes and the pros they affect." },
  { icon: <IconBolt size={22} />, title: "Bias to dispatch", body: "Speed is a feature. We move, measure, and adjust." },
  { icon: <IconHandshake size={22} />, title: "Pros come first", body: "If it doesn't help a tradesperson earn, we don't ship it." },
];

export function CareersPage() {
  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={64}>
          <Box className="mk-hero-content">
            <Badge variant="outline" radius="xl" size="sm" mb="md" style={{ letterSpacing: 1.5, borderColor: "rgba(255,255,255,0.5)", color: "white" }}>Careers</Badge>
            <Title order={1} maw={820} style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
              Help the people who fix the world get paid what they're worth.
            </Title>
            <Text size="lg" mt="md" maw={620} lh={1.55} fw={500} style={{ color: "rgba(255,255,255,0.85)" }}>
              Small team, real-world impact, remote-first with regional operations on the ground. We index on proof here too — ship work, not slide decks.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Values */}
      <Container size="xl" py={72} pb={56}>
        <Grid>
          {VALUES.map((v) => (
            <Grid.Col key={v.title} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder shadow="xs" radius="lg" p="md" h="100%">
                <ThemeIcon size={44} radius={12} mb="sm" color="orange" variant="light">{v.icon}</ThemeIcon>
                <Title order={4} mb={6}>{v.title}</Title>
                <Text size="sm" c="dimmed" lh={1.55}>{v.body}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Roles */}
      <Container size="xl" pb={88}>
        <Card withBorder shadow="md" radius="xl" p={48} style={{ background: "var(--gk-bg-canvas)", textAlign: "center" }}>
          <Stack align="center" gap="md">
            <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>Open roles</Text>
            <Title order={2} style={{ fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
              No open roles right now — but we're always meeting good people.
            </Title>
            <Text size="md" c="dimmed" maw={520} lh={1.6}>
              If you care about the trades and want to build with us, send a note and tell us what you'd want to work on.
            </Text>
            <Button component={Link} to="/contact" variant="filled" size="md" radius="md" mt={8}>
              Introduce yourself
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
