import { Box, Button, Container, Group } from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { GkLogo } from "../../brand/GkLogo";
import { useWaitlist } from "./WaitlistModal";

const ROLE_HOME: Record<string, string> = {
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
  const { openWaitlist } = useWaitlist();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255, 250, 245, 0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: "2px solid var(--mk-nav-border, rgba(255,100,0,.18))",
        boxShadow: "0 2px 12px rgba(200,60,0,.08)",
      }}
    >
      <Container size="xl">
        <Group h={66} justify="space-between" wrap="nowrap">
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <GkLogo height={36} />
          </Link>

          {/* Nav links */}
          <Group gap={4} style={{ flex: 1, marginLeft: 24, overflow: "hidden" }} visibleFrom="md">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Box
                  key={link.to}
                  component={Link}
                  to={link.to}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    color: active ? "#C42200" : "var(--gk-text-muted)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    borderBottom: active ? "2.5px solid #FF6600" : "2.5px solid transparent",
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
            <Button
              size="sm"
              variant="filled"
              radius="md"
              onClick={() => navigate(ROLE_HOME[user.role] ?? "/admin/dashboard")}
              style={{ flexShrink: 0, background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6600,#FFBA00))", border: "none" }}
            >
              Dashboard
            </Button>
          ) : (
            <Button
              size="sm"
              variant="filled"
              radius="md"
              onClick={() => openWaitlist("general")}
              style={{ flexShrink: 0, background: "var(--mk-gradient, linear-gradient(135deg,#C42200,#FF6600,#FFBA00))", border: "none" }}
            >
              Join Waitlist
            </Button>
          )}
        </Group>
      </Container>
    </Box>
  );
}
