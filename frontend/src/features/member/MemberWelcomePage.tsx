import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconExternalLink,
  IconRocket,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { useAuth } from "../../auth/AuthContext";
import { WallpaperBackground } from "../../brand/WallpaperBackground";

const ROLE_HOME: Record<string, string> = {
  pro: "/pro/dashboard",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

const FREE_FEATURES = [
  "Browse published pro profiles",
  "Build a basic GigKraft account",
  "Save your Google-verified identity",
];

const FREE_LOCKED = [
  "Publish Krafts (before/after jobs)",
  "Appear in homeowner search results",
  "Earn homeowner endorsements",
  "See your zipcode standing",
];

const PRO_FEATURES = [
  { text: "Everything in Free", active: true },
  { text: "Unlimited verified before/after Krafts", active: true },
  { text: "Homeowner endorsements on every job", active: true },
  { text: "Zipcode standing & performance insights", active: true },
  { text: "Full data export — your work is yours", active: true },
  { text: "Invoice verification & emergency dispatch (soon)", active: false },
];

const LIME = "#84CC16";

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

interface SiteInfo {
  template_pro_url_local: string;
  template_pro_url_prod: string;
  template_member_url_local: string;
  template_member_url_prod: string;
}

async function fetchSiteInfo(): Promise<SiteInfo> {
  const res = await fetch(`${API_BASE_URL}/api/public/site-info`);
  if (!res.ok) throw new Error("failed");
  return res.json() as Promise<SiteInfo>;
}

export function MemberWelcomePage() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [proProfileUrl, setProProfileUrl] = useState<string | null>(null);
  const [memberProfileUrl, setMemberProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteInfo()
      .then((info) => {
        const isProd = import.meta.env.PROD;
        setProProfileUrl(isProd ? info.template_pro_url_prod : info.template_pro_url_local);
        setMemberProfileUrl(isProd ? info.template_member_url_prod : info.template_member_url_local);
      })
      .catch(() => { /* silently fail */ });
  }, []);

  if (status === "loading") return null;

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
        <Container size="lg" w="100%">
          <Stack gap="xl">

            {/* Header */}
            <Stack gap={4} ta="center">
              <ThemeIcon
                size={56}
                radius="xl"
                style={{
                  background: "linear-gradient(135deg,#C42200 0%,#FF6B1A 55%,#84CC16 100%)",
                  margin: "0 auto",
                }}
              >
                <IconRocket size={28} color="#fff" />
              </ThemeIcon>
              <Title order={2} mt="sm">Welcome, {firstName}!</Title>
              <Text c="dimmed" size="sm">You're a GigKraft Member — free tier</Text>
            </Stack>

            {/* Pricing cards */}
            <Group align="stretch" gap="lg" justify="center" wrap="wrap" style={{ paddingTop: 20 }}>

              {/* Free card — matches pricing page exactly */}
              <Card
                withBorder
                shadow="sm"
                radius="xl"
                p={32}
                style={{
                  flex: "0 0 300px",
                  maxWidth: "100%",
                  position: "relative",
                  overflow: "visible",
                  borderColor: "var(--gk-accent-primary)",
                  borderWidth: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box style={{ ...badgeBase, background: "var(--gk-accent-primary)", color: "#fff" }}>
                  Your current plan
                </Box>
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box>
                    <Title order={3}>Free</Title>
                    <Text size="sm" c="dimmed" fw={600} mt={4}>Browse and explore GigKraft.</Text>
                  </Box>
                  <Group align="flex-end" gap={4}>
                    <Title style={{ fontSize: 48, lineHeight: 1, color: "var(--gk-accent-primary)" }}>$0</Title>
                    <Text size="sm" c="dimmed" fw={600} pb={8}>/mo</Text>
                  </Group>
                  <Text size="xs" c="dimmed" fw={600} mt={-12}>free forever</Text>
                  {memberProfileUrl && (
                    <Button
                      component="a"
                      href={memberProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      size="md"
                      radius="md"
                      fullWidth
                      rightSection={<IconExternalLink size={15} />}
                      style={{ borderColor: "var(--gk-accent-primary)", color: "var(--gk-accent-primary)" }}
                    >
                      Checkout free profile
                    </Button>
                  )}
                  <Button
                    size="md"
                    radius="md"
                    fullWidth
                    onClick={() => navigate("/pro/account")}
                    style={{ background: "var(--gk-accent-primary)", color: "#fff", border: "none" }}
                  >
                    Continue
                  </Button>
                  <Box style={{ height: 1, background: "var(--gk-border)", opacity: 0.4 }} />
                  <Stack gap="sm" style={{ flex: 1 }}>
                    {FREE_FEATURES.map((f) => (
                      <Group key={f} gap="sm">
                        <Text fw={700} size="sm" c="var(--gk-accent-primary)">✓</Text>
                        <Text size="sm" fw={600}>{f}</Text>
                      </Group>
                    ))}
                    {FREE_LOCKED.map((f) => (
                      <Group key={f} gap="sm">
                        <Text fw={700} size="sm" c="dimmed">○</Text>
                        <Text size="sm" fw={500} c="dimmed">{f}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Pro card — lime, matches pricing page exactly */}
              <Card
                withBorder
                shadow="lg"
                radius="xl"
                p={32}
                style={{
                  flex: "0 0 360px",
                  maxWidth: "100%",
                  background: LIME,
                  position: "relative",
                  overflow: "visible",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box style={{ ...badgeBase, background: "#fff", color: "#3a6e00" }}>
                  For every pro
                </Box>
                <Stack gap="md" style={{ flex: 1 }}>
                  <Box>
                    <Title order={3} style={{ color: "#0B1700" }}>Pro</Title>
                    <Text size="sm" fw={600} mt={4} style={{ color: "rgba(0,0,0,0.6)" }}>
                      Publish Krafts, earn endorsements, get found.
                    </Text>
                  </Box>
                  <Group align="flex-end" gap={4}>
                    <Title style={{ fontSize: 48, lineHeight: 1, color: "#fff" }}>$24.99</Title>
                    <Text size="sm" fw={600} pb={8} style={{ color: "rgba(255,255,255,0.8)" }}>/mo</Text>
                  </Group>
                  <Text size="xs" fw={600} mt={-12} style={{ color: "rgba(255,255,255,0.8)" }}>
                    billed monthly · cancel anytime
                  </Text>

                  {proProfileUrl && (
                    <Button
                      component="a"
                      href={proProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="md"
                      radius="md"
                      fullWidth
                      rightSection={<IconExternalLink size={15} />}
                      style={{ background: "rgba(0,0,0,0.15)", color: "#0B1700", border: "2px solid rgba(255,255,255,0.6)", fontWeight: 700 }}
                    >
                      Checkout pro profile
                    </Button>
                  )}

                  <Button
                    size="md"
                    radius="md"
                    fullWidth
                    onClick={() => navigate("/pro/account?tab=billing")}
                    rightSection={<IconArrowRight size={15} />}
                    style={{ background: "#fff", color: "#3a6e00", border: "none", fontWeight: 700 }}
                  >
                    Upgrade to Pro — $24.99/mo
                  </Button>

                  <Box style={{ height: 1, background: "rgba(255,255,255,0.4)" }} />
                  <Stack gap="sm" style={{ flex: 1 }}>
                    {PRO_FEATURES.map((f) => (
                      <Group key={f.text} gap="sm">
                        <Text fw={700} size="sm" style={{ color: f.active ? "#fff" : "rgba(255,255,255,0.5)" }}>
                          {f.active ? "✓" : "○"}
                        </Text>
                        <Text size="sm" fw={f.active ? 600 : 500} style={{ color: f.active ? "#0B1700" : "rgba(0,0,0,0.45)" }}>
                          {f.text}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>

            </Group>

            {/* Footer */}
            <Text ta="center" size="sm" c="dimmed" fw={600}>
              Annual plan saves 17% ·{" "}
              <Text
                component="span"
                size="sm"
                fw={700}
                style={{ color: "var(--gk-accent-primary)", cursor: "pointer" }}
                onClick={() => navigate("/pricing")}
              >
                Compare all plans →
              </Text>
            </Text>

          </Stack>
        </Container>
      </Center>
    </Box>
  );
}
