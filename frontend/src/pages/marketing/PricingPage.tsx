import { Box, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useWaitlist } from "../../components/marketing/WaitlistModal";

const FREE_FEATURES = [
  "Build Profile",
  "Store Krafts",
  "Receive Recommendations",
  "Share Profile with summary",
];

const PRO_FEATURES = [
  { text: "Everything in Free", active: true },
  { text: "Unlimited verified Krafts", active: true },
  { text: "Homeowner endorsements on every job", active: true },
  { text: "Zipcode standing & performance insights", active: true },
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

const badgeBase: React.CSSProperties = {
  position: "absolute",
  top: -13,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  zIndex: 1,
};

const LIME = "#84CC16";

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { openWaitlist } = useWaitlist();
  const { status, user } = useAuth();
  const navigate = useNavigate();

  function handleBuyPlan() {
    const plan = annual ? "annual" : "monthly";
    if (status === "authenticated") {
      // Members and pros both go to checkout; checkout handles already-subscribed guard
      navigate(`/pro/checkout?plan=${plan}`);
    } else {
      navigate(`/register?intent=subscribe&plan=${plan}`);
    }
  }

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
              Start free. Upgrade when you're ready.
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
        <Group align="stretch" gap="lg" justify="center" wrap="wrap" style={{ paddingTop: 20 }}>

          {/* Free — orange */}
          <Card
            withBorder
            shadow="sm"
            radius="xl"
            p={32}
            style={{ flex: "0 0 300px", maxWidth: "100%", position: "relative", overflow: "visible", borderColor: "var(--gk-accent-primary)", borderWidth: 2 }}
          >
            <Box style={{ ...badgeBase, background: "var(--gk-accent-primary)", color: "#fff" }}>
              Always free
            </Box>
            <Stack gap="md">
              <Box>
                <Title order={3}>Free</Title>
                <Text size="sm" c="dimmed" fw={600} mt={4}>Get started with your pro presence.</Text>
              </Box>
              <Group align="flex-end" gap={4}>
                <Title style={{ fontSize: 48, lineHeight: 1, color: "var(--gk-accent-primary)" }}>$0</Title>
                <Text size="sm" c="dimmed" fw={600} pb={8}>/mo</Text>
              </Group>
              <Text size="xs" c="dimmed" fw={600} mt={-12}>free forever</Text>
              <Button component={Link} to="/login" size="md" radius="md" fullWidth style={{ background: "var(--gk-accent-primary)", color: "#fff", border: "none" }}>
                Get Started
              </Button>
              <Box style={{ height: 1, background: "var(--gk-border)", opacity: 0.4 }} />
              <Stack gap="sm">
                {FREE_FEATURES.map((f) => (
                  <Group key={f} gap="sm">
                    <Text fw={700} size="sm" c="var(--gk-accent-primary)">✓</Text>
                    <Text size="sm" fw={600}>{f}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* Pro — lime green background */}
          <Card
            withBorder
            shadow="lg"
            radius="xl"
            p={32}
            style={{ flex: "0 0 360px", maxWidth: "100%", background: LIME, position: "relative", overflow: "visible", border: "none" }}
          >
            <Box style={{ ...badgeBase, background: "#fff", color: "#3a6e00" }}>
              For every pro
            </Box>
            <Stack gap="md">
              <Box>
                <Title order={3} style={{ color: "#0B1700" }}>Pro</Title>
                <Text size="sm" fw={600} mt={4} style={{ color: "rgba(0,0,0,0.6)" }}>Publish Krafts, earn endorsements, get found.</Text>
              </Box>
              <Group align="flex-end" gap={4}>
                <Title style={{ fontSize: 48, lineHeight: 1, color: "#fff" }}>{price}</Title>
                <Text size="sm" fw={600} pb={8} style={{ color: "rgba(255,255,255,0.8)" }}>{unit}</Text>
              </Group>
              <Text size="xs" fw={600} mt={-12} style={{ color: "rgba(255,255,255,0.8)" }}>{note}</Text>
              <Button
                size="md"
                radius="md"
                fullWidth
                disabled={status === "loading"}
                loading={status === "loading"}
                onClick={handleBuyPlan}
                style={{ background: "#fff", color: "#3a6e00", border: "none", fontWeight: 700 }}
              >
                {status === "authenticated" && user?.role === "pro" ? "Go to checkout" : "Buy Plan"}
              </Button>
              <Box style={{ height: 1, background: "rgba(255,255,255,0.4)" }} />
              <Stack gap="sm">
                {PRO_FEATURES.map((f) => (
                  <Group key={f.text} gap="sm">
                    <Text fw={700} size="sm" style={{ color: f.active ? "#fff" : "rgba(255,255,255,0.5)" }}>
                      {f.active ? "✓" : "○"}
                    </Text>
                    <Text size="sm" fw={f.active ? 600 : 500} style={{ color: f.active ? "#0B1700" : "rgba(0,0,0,0.45)" }}>{f.text}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* Enterprise — gradient */}
          <Card
            withBorder
            shadow="lg"
            radius="xl"
            p={32}
            style={{ flex: "0 0 360px", maxWidth: "100%", background: "var(--mk-gradient)", color: "#fff", position: "relative", overflow: "visible", border: "none" }}
          >
            <Box style={{ ...badgeBase, background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(4px)" }}>
              Coming soon
            </Box>
            <Stack gap="md">
              <Box>
                <Title order={3} style={{ color: "#fff" }}>Enterprise</Title>
                <Text size="sm" fw={600} mt={4} style={{ color: "rgba(255,255,255,0.8)" }}>Source &amp; dispatch proven pros at scale.</Text>
              </Box>
              <Title style={{ fontSize: 42, lineHeight: 1, color: "#fff" }}>Custom</Title>
              <Text size="xs" fw={600} mt={-12} style={{ color: "rgba(255,255,255,0.75)" }}>in development — join the waitlist</Text>
              <button
                style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "rgba(0,0,0,0.35)", color: "#fff", fontWeight: 700, fontSize: 14, border: "2px solid rgba(255,255,255,0.5)", cursor: "pointer", backdropFilter: "blur(4px)" }}
                onClick={() => openWaitlist("enterprise")}
              >
                Join the Waitlist
              </button>
              <Box style={{ height: 1, background: "rgba(255,255,255,0.3)" }} />
              <Stack gap="sm">
                {ENT_FEATURES.map((f) => (
                  <Group key={f} gap="sm">
                    <Text fw={700} size="sm" style={{ color: "#fff" }}>✓</Text>
                    <Text size="sm" fw={600} style={{ color: "rgba(255,255,255,0.92)" }}>{f}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Group>

        <Text ta="center" size="sm" c="dimmed" fw={600} mt={28}>
          Homeowners browse and hire for free — Pro pricing applies to tradespeople publishing portfolios.
        </Text>
      </Container>
    </Box>
  );
}
