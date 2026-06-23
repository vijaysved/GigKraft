import { Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink, IconCircleCheck, IconCircleDashed } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { trackSitePageView } from "../../api/endpoints";

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

const MEMBER_FEATURES = [
  "Public profile with bio & trade",
  "Up to 3 skill tags",
  "Receive recommendations",
  "Share your profile link",
];

const MEMBER_MISSING = [
  "Verified Krafts (portfolio)",
  "Homeowner endorsements",
  "Zipcode standing & insights",
  "Licensed / insured badge",
];

const PRO_FEATURES = [
  "Everything in Member",
  "Unlimited verified Krafts",
  "Homeowner endorsements on every job",
  "Zipcode standing & performance insights",
  "Licensed / insured badge shown",
  "Emergency dispatch eligibility",
];

export function ProfileComparisonSection() {
  const [proUrl, setProUrl] = useState<string | null>(null);
  const [memberUrl, setMemberUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteInfo()
      .then((info) => {
        const isProd = import.meta.env.PROD;
        setProUrl(isProd ? info.template_pro_url_prod : info.template_pro_url_local);
        setMemberUrl(isProd ? info.template_member_url_prod : info.template_member_url_local);
      })
      .catch(() => {});

    trackSitePageView(window.location.href);
  }, []);

  const LIME = "#84CC16";

  return (
    <Box style={{ borderTop: "1px solid var(--gk-border)", background: "var(--gk-bg-canvas)" }} py={64}>
      <Container size="xl">
        <Stack align="center" ta="center" mb={40} gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="var(--gk-accent-primary)" style={{ letterSpacing: 1.5 }}>
            See it live
          </Text>
          <Title order={2} style={{ fontSize: "clamp(22px,2.8vw,34px)", letterSpacing: -0.5 }}>
            Compare a Member profile vs a Pro profile
          </Title>
          <Text size="sm" c="dimmed" maw={480}>
            These are real, seeded profiles — click through to see exactly what each tier looks like to a visitor.
          </Text>
        </Stack>

        <Group align="stretch" justify="center" gap="lg" wrap="wrap">
          {/* Member card */}
          <Box
            style={{
              flex: "0 0 320px",
              maxWidth: "100%",
              border: "1px solid var(--gk-border)",
              borderRadius: 16,
              padding: 28,
              background: "var(--gk-bg-surface)",
            }}
          >
            <Stack gap="md">
              <Box>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }} mb={4}>
                  Free · Member
                </Text>
                <Title order={4}>What visitors see on a free profile</Title>
              </Box>

              <Stack gap={6}>
                {MEMBER_FEATURES.map((f) => (
                  <Group key={f} gap="xs" align="flex-start">
                    <IconCircleCheck size={15} color="var(--gk-accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text size="sm" fw={500}>{f}</Text>
                  </Group>
                ))}
                {MEMBER_MISSING.map((f) => (
                  <Group key={f} gap="xs" align="flex-start">
                    <IconCircleDashed size={15} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text size="sm" c="dimmed">{f}</Text>
                  </Group>
                ))}
              </Stack>

              {memberUrl && (
                <Button
                  component="a"
                  href={memberUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  radius="md"
                  fullWidth
                  rightSection={<IconExternalLink size={14} />}
                  style={{ borderColor: "var(--gk-accent-primary)", color: "var(--gk-accent-primary)" }}
                >
                  View Member profile
                </Button>
              )}
            </Stack>
          </Box>

          {/* Pro card */}
          <Box
            style={{
              flex: "0 0 320px",
              maxWidth: "100%",
              borderRadius: 16,
              padding: 28,
              background: LIME,
            }}
          >
            <Stack gap="md">
              <Box>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: 1, color: "rgba(0,0,0,0.55)" }} mb={4}>
                  Paid · Pro
                </Text>
                <Title order={4} style={{ color: "#0B1700" }}>What visitors see on a Pro profile</Title>
              </Box>

              <Stack gap={6}>
                {PRO_FEATURES.map((f) => (
                  <Group key={f} gap="xs" align="flex-start">
                    <IconCircleCheck size={15} color="#fff" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text size="sm" fw={600} style={{ color: "#0B1700" }}>{f}</Text>
                  </Group>
                ))}
              </Stack>

              {proUrl && (
                <Button
                  component="a"
                  href={proUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  radius="md"
                  fullWidth
                  rightSection={<IconExternalLink size={14} />}
                  style={{ background: "rgba(0,0,0,0.15)", color: "#0B1700", border: "2px solid rgba(255,255,255,0.6)", fontWeight: 700 }}
                >
                  View Pro profile
                </Button>
              )}
            </Stack>
          </Box>
        </Group>
      </Container>
    </Box>
  );
}
