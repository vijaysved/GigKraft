import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCheck,
  IconLock,
  IconRocket,
} from "@tabler/icons-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { WallpaperBackground } from "../../brand/WallpaperBackground";

const ROLE_HOME: Record<string, string> = {
  pro: "/pro/dashboard",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

const MEMBER_CAN = [
  "Browse published pro profiles",
  "Create a basic GigKraft account",
  "Save your Google-verified identity",
];

const MEMBER_CANNOT = [
  "Publish Krafts (before/after jobs)",
  "Appear in homeowner search results",
  "Earn homeowner endorsements",
  "See your zipcode standing",
];

const PRO_FEATURES = [
  "Unlimited verified before/after Krafts",
  "Homeowner endorsements on every job",
  "Zipcode standing & performance insights",
  "Full data export — your work is yours",
  "Publish your profile for homeowners to find",
];

export function MemberWelcomePage() {
  const { status, user } = useAuth();
  const navigate = useNavigate();

  if (status === "loading") return null;

  // Non-members who land here get sent to their actual home
  if (status === "authenticated" && user && user.role !== "member") {
    return <Navigate to={ROLE_HOME[user.role] ?? "/"} replace />;
  }

  if (status === "anonymous") {
    return <Navigate to="/register" replace />;
  }

  const firstName = user?.first_name || "there";

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" py={48} px="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={520} maw="100%" gap="lg">

          {/* Header */}
          <Stack gap={4} ta="center">
            <ThemeIcon
              size={56}
              radius="xl"
              style={{ background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6B1A,#84CC16))", margin: "0 auto" }}
            >
              <IconRocket size={28} color="#fff" />
            </ThemeIcon>
            <Title order={2} mt="sm">Welcome, {firstName}!</Title>
            <Text c="dimmed" size="sm">You're a GigKraft Member — free tier</Text>
          </Stack>

          {/* What you can do */}
          <Paper withBorder radius="lg" p="lg" bg="var(--gk-bg-surface)">
            <Stack gap="sm">
              <Text fw={700} size="sm" tt="uppercase" style={{ letterSpacing: 1, color: "var(--gk-text-muted)" }}>
                Your free account
              </Text>
              <Stack gap="xs">
                {MEMBER_CAN.map((f) => (
                  <Group key={f} gap="sm">
                    <IconCheck size={15} color="var(--gk-accent-primary)" strokeWidth={2.5} />
                    <Text size="sm">{f}</Text>
                  </Group>
                ))}
              </Stack>
              <Divider my={4} />
              <Stack gap="xs">
                {MEMBER_CANNOT.map((f) => (
                  <Group key={f} gap="sm">
                    <IconLock size={15} color="var(--gk-text-muted)" />
                    <Text size="sm" c="dimmed">{f}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Paper>

          {/* Upgrade card */}
          <Card
            radius="lg"
            padding="lg"
            style={{ background: "var(--gk-brand-gradient, linear-gradient(135deg,#1a4a8a,#3498db))" }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Badge variant="filled" color="orange" size="sm">Pro Vault</Badge>
                  <Title order={4} style={{ color: "#fff" }}>Upgrade to Pro</Title>
                </Stack>
                <Stack gap={0} align="flex-end">
                  <Text fw={900} size="xl" style={{ color: "#fff", lineHeight: 1 }}>$24.99</Text>
                  <Text size="xs" style={{ color: "rgba(255,255,255,0.7)" }}>/mo</Text>
                </Stack>
              </Group>

              <Stack gap="xs">
                {PRO_FEATURES.map((f) => (
                  <Group key={f} gap="sm">
                    <IconCheck size={14} color="#fff" strokeWidth={3} />
                    <Text size="sm" style={{ color: "rgba(255,255,255,0.9)" }}>{f}</Text>
                  </Group>
                ))}
              </Stack>

              <Button
                fullWidth
                size="md"
                onClick={() => navigate("/pro/checkout?plan=monthly")}
                rightSection={<IconArrowRight size={16} />}
                style={{ background: "#fff", color: "var(--gk-accent-primary)", fontWeight: 700 }}
              >
                Upgrade to Pro — $24.99/mo
              </Button>

              <Text size="xs" ta="center" style={{ color: "rgba(255,255,255,0.6)" }}>
                Cancel anytime · No setup fees · Annual plan saves 17%
              </Text>
            </Stack>
          </Card>

          {/* Compare link */}
          <Text ta="center" size="sm" c="dimmed">
            <Anchor component={Link} to="/member/compare" style={{ color: "var(--gk-accent-primary)" }}>
              See a full Member vs Pro comparison →
            </Anchor>
          </Text>

          {/* Already subscribed? */}
          <Text ta="center" size="xs" c="dimmed">
            Already subscribed?{" "}
            <Anchor component={Link} to="/pro/checkout" style={{ color: "var(--gk-accent-primary)" }}>
              Go to checkout →
            </Anchor>
          </Text>
        </Stack>
      </Center>
    </Box>
  );
}
