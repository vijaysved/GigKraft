import { Box, Button, Container, Group, Text } from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

const ROLE_HOME: Record<string, string> = {
  member: "/member/welcome",
  pro: "/pro/reviews",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

const NAV_LINKS = [
  { label: "For Pros", to: "/for-pros" },
  { label: "Homeowners", to: "/for-homeowners" },
  { label: "Trust Graph", to: "/trust-graph" },
  { label: "Enterprise", to: "/enterprise" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

export function MarketingNav() {
  const { status, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255, 250, 245, 0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--mk-nav-border, rgba(255,100,0,.18))",
        boxShadow: "0 1px 8px rgba(200,60,0,.06)",
      }}
    >
      <Container size="xl">
        <Group h={46} justify="space-between" wrap="nowrap">
          {/* Brand text */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <Text
              fw={900}
              size="sm"
              style={{
                background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6600,#7AE600))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: -0.3,
              }}
            >
              gigKraft.com
            </Text>
          </Link>

          {/* Nav links */}
          <Group gap={2} style={{ flex: 1, marginLeft: 20, overflow: "hidden" }} visibleFrom="md">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Box
                  key={link.to}
                  component={Link}
                  to={link.to}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 13,
                    color: active ? "var(--gk-accent-primary)" : "var(--gk-text-muted)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    borderBottom: active ? "2px solid var(--gk-accent-primary)" : "2px solid transparent",
                    transition: "color .15s",
                  }}
                >
                  {link.label}
                </Box>
              );
            })}
          </Group>

          {/* CTA */}
          {status === "authenticated" && user ? (
            user.role === "member" ? (
              <Button
                size="xs"
                radius="md"
                onClick={() => navigate("/pro/checkout")}
                style={{ flexShrink: 0, background: "var(--gk-accent-primary)", border: "none" }}
              >
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                size="xs"
                radius="md"
                onClick={() => navigate(ROLE_HOME[user.role] ?? "/admin/dashboard")}
                style={{ flexShrink: 0, background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6600,#7AE600))", border: "none" }}
              >
                Dashboard
              </Button>
            )
          ) : (
            <Button
              size="xs"
              radius="md"
              onClick={() => navigate("/register")}
              style={{ flexShrink: 0, background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6600,#7AE600))", border: "none" }}
            >
              Join free
            </Button>
          )}
        </Group>
      </Container>
    </Box>
  );
}
