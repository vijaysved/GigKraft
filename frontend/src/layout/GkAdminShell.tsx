import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAddressBook,
  IconBrandStripe,
  IconChevronUp,
  IconLayoutDashboard,
  IconLogout,
  IconMapPin,
  IconPalette,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { GkLogo } from "../brand/GkLogo";
import { useTheme } from "../theme/ThemeProvider";
import { THEMES, THEME_IDS } from "../theme/themes";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconLayoutDashboard, to: "/gk-admin/dashboard" },
  { label: "Users", icon: IconUsers, to: "/gk-admin/users" },
  { label: "Nodes", icon: IconMapPin, to: "/gk-admin/nodes" },
  { label: "Safety", icon: IconShield, to: "/gk-admin/safety" },
  { label: "Prospects", icon: IconAddressBook, to: "/gk-admin/prospects" },
  { label: "Stripe", icon: IconBrandStripe, to: "/gk-admin/stripe" },
];

const navLinkStyles = {
  root: {
    borderRadius: 8,
    color: "var(--gk-text-sidebar)",
    "&[data-active]": { background: "var(--gk-bg-sidebar-active)", color: "#fff" },
  },
};

export function GkAdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { themeId, setThemeId } = useTheme();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "G").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "GK Admin";

  return (
    <AppShell navbar={{ width: 240, breakpoint: "sm" }} padding="md">
      <AppShell.Navbar
        p="sm"
        style={{
          background: "var(--gk-bg-sidebar)",
          borderRight: "1px solid var(--gk-border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <Box px={4} pb="sm" pt={4}>
          <Box style={{ display: "inline-block", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "3px 6px" }}>
            <GkLogo height={28} />
          </Box>
        </Box>

        {/* Brand header */}
        <Group gap="xs" px={4} mb="md">
          <Badge size="sm" color="violet" variant="filled" radius="sm">GK Admin</Badge>
          <Text size="xs" c="dimmed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Super Console
          </Text>
        </Group>

        <Divider style={{ borderColor: "var(--gk-border)" }} mb="sm" />

        {/* Nav items */}
        <Stack gap={4} style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <RouterNavLink key={to} to={to} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <NavLink label={label} leftSection={<Icon size={18} />} active={isActive} styles={navLinkStyles} />
              )}
            </RouterNavLink>
          ))}
        </Stack>

        {/* User context */}
        <Stack gap={0} mt="auto">
          <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />
          <Group gap={4} px={4} mb={4}>
            <Badge size="xs" color="violet" variant="dot" style={{ color: "rgba(255,255,255,0.5)" }}>
              gk_admin · platform-wide
            </Badge>
          </Group>
          <Menu shadow="md" width={200} position="top">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%", borderRadius: 8, padding: "8px 6px" }}>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar size={36} color="violet" radius="xl">{initials}</Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--gk-text-sidebar)" truncate>{displayName}</Text>
                      <Text size="xs" style={{ color: "rgba(255,255,255,0.4)" }} truncate>gk_admin</Text>
                    </Stack>
                  </Group>
                  <IconChevronUp size={14} color="var(--gk-text-sidebar)" style={{ opacity: 0.5, flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email ?? "admin@gigkraft.com"}</Menu.Label>
              <Menu.Divider />
              <Menu.Label>
                <Group gap={4}>
                  <IconPalette size={12} />
                  Theme
                </Group>
              </Menu.Label>
              {THEME_IDS.map((id) => {
                const def = THEMES[id];
                return (
                  <Menu.Item
                    key={id}
                    onClick={() => setThemeId(id)}
                    leftSection={
                      <Box
                        w={12}
                        h={12}
                        style={{
                          borderRadius: "50%",
                          background: def.brand.brandGradient,
                          border: id === themeId ? "2px solid #fff" : "2px solid transparent",
                          boxShadow: id === themeId ? "0 0 0 1px #aaa" : "none",
                          flexShrink: 0,
                        }}
                      />
                    }
                    style={{ fontWeight: id === themeId ? 700 : 400 }}
                  >
                    {def.label}
                  </Menu.Item>
                );
              })}
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={() => { logout(); navigate("/login"); }}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Text size="xs" ta="center" py={6} style={{ color: "rgba(255,255,255,0.6)" }}>
            Powered by gigKraft.com
          </Text>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "var(--gk-bg-canvas)" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
