import { Box, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWaitlist } from "../../components/marketing/WaitlistModal";

const PRO_FEATURES = [
  { text: "Unlimited verified Krafts", active: true },
  { text: "Homeowner endorsements on every job", active: true },
  { text: "Zipcode standing & performance insights", active: true },
  { text: "Your own portfolio profile page", active: true },
  { text: "Full data export — your work is yours", active: true },
  { text: "Invoice verification & emergency dispatch (soon)", active: false },
];

const ENT_FEATURES = [
  "Everything in Pro",
  "Branded recruitment portal",
  "Dispatch API & integrations",
  "Multi-zipcode coverage & SLA",
  "Dedicated account manager",
];

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { openWaitlist } = useWaitlist();

  const price = annual ? "$249.99" : "$24.99";
  const unit = annual ? "/yr" : "/mo";
  const note = annual ? "billed once a year · recurring" : "billed monthly · recurring";

  const tabBase: React.CSSProperties = { fontWeight: 700, fontSize: 14, padding: "8px 18px", borderRadius: 999, cursor: "pointer", border: "none", whiteSpace: "nowrap" };
  const activeTab: React.CSSProperties = { ...tabBase, background: "var(--gk-accent-primary)", color: "var(--gk-bg-surface)" };
  const idleTab: React.CSSProperties = { ...tabBase, background: "transparent", color: "var(--gk-text-muted)" };

  return (
    <Box>
      {/* Hero */}
      <Box className="mk-hero">
        <Container size="xl" py={64}>
          <Box className="mk-hero-content">
          <Stack align="center" ta="center" gap="md">
            <Box style={{ padding: "6px 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "white" }}>
              Pricing &amp; tiers
            </Box>
            <Title order={1} maw={760} style={{ fontSize: "clamp(32px,4.6vw,54px)", lineHeight: 1.04, letterSpacing: -1, color: "white" }}>
              One flat rate to build your reputation.
            </Title>
            <Text size="lg" maw={480} lh={1.55} style={{ color: "rgba(255,255,255,0.85)" }}>No per-lead fees. No rake on your work. Cancel anytime.</Text>

            {/* Toggle */}
            <Group gap={4} p={4} style={{ border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, background: "rgba(0,0,0,0.2)" }} mt={6}>
              <button style={annual ? idleTab : activeTab} onClick={() => setAnnual(false)}>Monthly</button>
              <button style={annual ? activeTab : idleTab} onClick={() => setAnnual(true)}>Annual · save 17%</button>
            </Group>
          </Stack>
          </Box>
        </Container>
      </Box>

      {/* Tiers */}
      <Container size="xl" py={64} pb={80}>
        <Group align="stretch" gap="lg" justify="center" wrap="wrap">
          {/* Pro */}
          <Card
            withBorder
            shadow="lg"
            radius="xl"
            p={32}
            style={{ flex: "0 0 380px", maxWidth: "100%", borderColor: "var(--gk-accent-primary)", borderWidth: 2, position: "relative" }}
          >
            <Box style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", background: "var(--gk-accent-primary)", color: "var(--gk-bg-surface)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              For every pro
            </Box>
            <Stack gap="md">
              <Box>
                <Title order={3}>Pro</Title>
                <Text size="sm" c="dimmed" fw={600} mt={4}>Publish Krafts, earn endorsements, get found.</Text>
              </Box>
              <Group align="flex-end" gap={4}>
                <Title style={{ fontSize: 48, lineHeight: 1 }}>{price}</Title>
                <Text size="sm" c="dimmed" fw={600} pb={8}>{unit}</Text>
              </Group>
              <Text size="xs" c="dimmed" fw={600} mt={-12}>{note}</Text>
              <Button component={Link} to="/contact" variant="filled" size="md" radius="md" fullWidth>
                Build your profile
              </Button>
              <Box style={{ height: 1, background: "var(--gk-border)", opacity: 0.25 }} />
              <Stack gap="sm">
                {PRO_FEATURES.map((f) => (
                  <Group key={f.text} gap="sm">
                    <Text fw={700} size="sm" style={{ color: f.active ? "var(--gk-accent-primary)" : "var(--gk-text-muted)", opacity: f.active ? 1 : 0.6 }}>
                      {f.active ? "✓" : "○"}
                    </Text>
                    <Text size="sm" fw={f.active ? 600 : 500} c={f.active ? undefined : "dimmed"}>{f.text}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* Enterprise */}
          <Card
            withBorder
            shadow="lg"
            radius="xl"
            p={32}
            style={{ flex: "0 0 380px", maxWidth: "100%", background: "var(--gk-bg-sidebar)", color: "var(--gk-text-sidebar)", position: "relative" }}
          >
            <Box style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", background: "var(--gk-bg-surface)", color: "var(--gk-bg-sidebar)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Coming soon
            </Box>
            <Stack gap="md">
              <Box>
                <Title order={3} style={{ color: "var(--gk-text-sidebar)" }}>Enterprise</Title>
                <Text size="sm" fw={600} mt={4} style={{ opacity: 0.75 }}>Source &amp; dispatch proven pros at scale.</Text>
              </Box>
              <Title style={{ fontSize: 42, lineHeight: 1, color: "var(--gk-text-sidebar)" }}>Custom</Title>
              <Text size="xs" fw={600} mt={-12} style={{ opacity: 0.75 }}>in development — join the waitlist</Text>
              <Button variant="filled" size="md" radius="md" fullWidth onClick={() => openWaitlist("enterprise")}>
                Join the Waitlist
              </Button>
              <Box style={{ height: 1, background: "currentColor", opacity: 0.2 }} />
              <Stack gap="sm">
                {ENT_FEATURES.map((f) => (
                  <Group key={f} gap="sm">
                    <Text fw={700} size="sm">✓</Text>
                    <Text size="sm" fw={600} style={{ opacity: 0.92 }}>{f}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Group>

        <Text ta="center" size="sm" c="dimmed" fw={600} mt={28}>
          Homeowners browse and hire for free — pricing applies to tradespeople publishing portfolios.
        </Text>
      </Container>
    </Box>
  );
}
