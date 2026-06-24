import { Box, Container, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "For Pros", to: "/for-pros" },
  { label: "Homeowners", to: "/for-homeowners" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/contact" },
  { label: "Terms", to: "/terms" },
];

export function MarketingFooter() {
  return (
    <Box component="footer" className="mk-footer">
      <Container size="xl">
        <Group justify="space-between" py={10} wrap="wrap" gap="xs" align="center">
          <Text size="xs" fw={700} style={{ color: "rgba(255,255,255,0.45)", letterSpacing: -0.2 }}>
            © 2026 gigKraft.com, Inc.
          </Text>
          <Group gap={20} wrap="wrap">
            {LINKS.map((l) => (
              <Text
                key={l.label}
                component={Link}
                to={l.to}
                size="xs"
                fw={600}
                className="mk-footer-link"
              >
                {l.label}
              </Text>
            ))}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
