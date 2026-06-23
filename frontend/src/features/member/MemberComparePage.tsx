import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck, IconLock, IconX } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

interface Feature {
  label: string;
  member: boolean | "partial";
  pro: boolean;
}

const FEATURES: Feature[] = [
  { label: "Google-verified account", member: true, pro: true },
  { label: "Browse published pro profiles", member: true, pro: true },
  { label: "Basic GigKraft identity", member: true, pro: true },
  { label: "Publish before/after Krafts", member: false, pro: true },
  { label: "Homeowner endorsements on jobs", member: false, pro: true },
  { label: "Appear in homeowner search results", member: false, pro: true },
  { label: "Zipcode standing & ranking", member: false, pro: true },
  { label: "Performance insights & analytics", member: false, pro: true },
  { label: "Full data export", member: false, pro: true },
  { label: "Invoice verification (coming soon)", member: false, pro: true },
  { label: "Emergency dispatch (coming soon)", member: false, pro: true },
];

function FeureCell({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return (
      <ThemeIcon size={22} radius="xl" color="green" variant="light">
        <IconCheck size={13} strokeWidth={3} />
      </ThemeIcon>
    );
  }
  if (value === "partial") {
    return (
      <ThemeIcon size={22} radius="xl" color="orange" variant="light">
        <IconLock size={13} />
      </ThemeIcon>
    );
  }
  return (
    <ThemeIcon size={22} radius="xl" color="gray" variant="light">
      <IconX size={13} />
    </ThemeIcon>
  );
}

export function MemberComparePage() {
  const { status } = useAuth();
  const navigate = useNavigate();

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gk-bg-canvas)" }}>
      {/* Hero */}
      <Box className="mk-hero" style={{ padding: "56px 0" }}>
        <Container size="md">
          <Box className="mk-hero-content">
            <Stack align="center" ta="center" gap="sm">
              <Title
                order={1}
                style={{ fontSize: "clamp(28px,4vw,46px)", color: "#fff", lineHeight: 1.1, letterSpacing: -0.5 }}
              >
                Member vs Pro
              </Title>
              <Text size="lg" style={{ color: "rgba(255,255,255,0.85)" }} maw={420}>
                See exactly what you unlock by upgrading to GigKraft Pro.
              </Text>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container size="md" py={64}>
        <Stack gap="xl">
          {/* Comparison table */}
          <Box style={{ overflowX: "auto" }}>
            <Table
              withTableBorder
              withColumnBorders
              highlightOnHover
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "56%" }}>Feature</Table.Th>
                  <Table.Th ta="center" style={{ width: "22%" }}>
                    <Stack gap={2} align="center">
                      <Text fw={700} size="sm">Member</Text>
                      <Text size="xs" c="dimmed">Free forever</Text>
                    </Stack>
                  </Table.Th>
                  <Table.Th
                    ta="center"
                    style={{ width: "22%", background: "color-mix(in srgb, var(--gk-accent-primary) 8%, transparent)" }}
                  >
                    <Stack gap={2} align="center">
                      <Text fw={700} size="sm" c="var(--gk-accent-primary)">Pro</Text>
                      <Text size="xs" c="dimmed">$24.99/mo</Text>
                    </Stack>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {FEATURES.map((f) => (
                  <Table.Tr key={f.label}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{f.label}</Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Group justify="center">
                        <FeureCell value={f.member} />
                      </Group>
                    </Table.Td>
                    <Table.Td ta="center" style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 4%, transparent)" }}>
                      <Group justify="center">
                        <FeureCell value={f.pro} />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          {/* Pricing summary + CTA */}
          <Box
            style={{
              background: "var(--gk-brand-gradient, linear-gradient(135deg,#1a4a8a,#3498db))",
              borderRadius: 16,
              padding: "32px 28px",
            }}
          >
            <Stack gap="md" align="center" ta="center">
              <Stack gap={4}>
                <Title order={3} style={{ color: "#fff" }}>Ready to unlock Pro?</Title>
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  One flat rate. Cancel anytime.
                </Text>
              </Stack>
              <Group gap="lg" justify="center">
                <Stack gap={0} align="center">
                  <Text fw={900} size="xl" style={{ color: "#fff" }}>$24.99</Text>
                  <Text size="xs" style={{ color: "rgba(255,255,255,0.7)" }}>/month</Text>
                </Stack>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>or</Text>
                <Stack gap={0} align="center">
                  <Text fw={900} size="xl" style={{ color: "#fff" }}>$249.99</Text>
                  <Text size="xs" style={{ color: "rgba(255,255,255,0.7)" }}>/year · save 17%</Text>
                </Stack>
              </Group>
              <Button
                size="lg"
                onClick={() => navigate("/subscribe")}
                style={{ background: "#fff", color: "var(--gk-accent-primary)", fontWeight: 700, paddingLeft: 32, paddingRight: 32 }}
              >
                Upgrade to Pro →
              </Button>
            </Stack>
          </Box>

          {/* Back link */}
          <Text ta="center" size="sm">
            <Anchor component={Link} to="/member/welcome" style={{ color: "var(--gk-text-muted)" }}>
              ← Back to your member dashboard
            </Anchor>
            {status === "anonymous" && (
              <>
                {" · "}
                <Anchor component={Link} to="/register" style={{ color: "var(--gk-accent-primary)" }}>
                  Create a free account
                </Anchor>
              </>
            )}
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
