import { Box, Container, Divider, Group, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";

const COLS = [
  {
    heading: "For Pros",
    links: [
      { label: "How It Works", to: "/for-pros" },
      { label: "Pricing & Tiers", to: "/pricing" },
      { label: "Build Your Profile", to: "/pricing" },
    ],
  },
  {
    heading: "Homeowners",
    links: [
      { label: "How It Works", to: "/for-homeowners" },
      { label: "Discover Pros", to: "/for-homeowners" },
      { label: "The Trust Graph", to: "/trust-graph" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About & Trends", to: "/about" },
      { label: "Enterprise", to: "/enterprise" },
      { label: "Careers", to: "/careers" },
      { label: "Manifesto", to: "/trust-graph" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Help Center", to: "/contact" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <Box component="footer" className="mk-footer">
      <Container size="xl" py="xl">
        <Group align="flex-start" gap={40} wrap="wrap">
          {/* Brand blurb */}
          <Stack gap="sm" style={{ maxWidth: 280, flex: "0 0 auto" }}>
            <Box className="mk-footer-logo">
              <GkLogo height={32} />
            </Box>
            <Text size="sm" lh={1.6} style={{ color: "rgba(255,255,255,0.7)" }}>
              The hyper-localized trade marketplace where verified field proof beats star ratings.
              Browse the work, not the words.
            </Text>
            <Group gap={6} align="center">
              <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "#6EF0A0", boxShadow: "0 0 0 3px rgba(110,240,160,.2)" }} />
              <Text size="xs" fw={600} ff="monospace" style={{ color: "rgba(255,255,255,0.5)" }}>serving your zipcode · LIVE</Text>
            </Group>
          </Stack>

          {/* Nav columns */}
          {COLS.map((col) => (
            <Stack key={col.heading} gap={8} style={{ flex: "0 0 auto" }}>
              <Text size="xs" fw={700} tt="uppercase" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>
                {col.heading}
              </Text>
              {col.links.map((l) => (
                <Text
                  key={l.label}
                  component={Link}
                  to={l.to}
                  size="sm"
                  fw={600}
                  className="mk-footer-link"
                >
                  {l.label}
                </Text>
              ))}
            </Stack>
          ))}
        </Group>
      </Container>

      <Divider className="mk-footer-divider" />
      <Container size="xl">
        <Group justify="space-between" py="sm" wrap="wrap" gap="xs">
          <Text size="xs" fw={600} style={{ color: "rgba(255,255,255,0.45)" }}>© 2026 gigKraft.com, Inc. · Built for the zipcodes you work in.</Text>
          <Group gap="lg">
            <Text size="xs" fw={600} component={Link} to="/contact" className="mk-footer-link">Privacy</Text>
            <Text size="xs" fw={600} component={Link} to="/contact" className="mk-footer-link">Terms</Text>
            <Text size="xs" fw={600} component={Link} to="/contact" className="mk-footer-link">SMS / WhatsApp Policy</Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
