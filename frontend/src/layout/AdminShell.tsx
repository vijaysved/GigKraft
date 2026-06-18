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
  IconAlertTriangle,
  IconChevronUp,
  IconLayoutDashboard,
  IconLogout,
  IconPhotoCheck,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { GkLogo } from "../brand/GkLogo";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconLayoutDashboard, to: "/admin/dashboard" },
  { label: "Triage", icon: IconAlertTriangle, to: "/admin/triage" },
  { label: "Safety", icon: IconShield, to: "/admin/safety" },
  { label: "Pros", icon: IconUsers, to: "/admin/pros" },
  { label: "Krafts", icon: IconPhotoCheck, to: "/admin/krafts" },
  { label: "Settings", icon: IconSettings, to: "/admin/settings" },
];

const navLinkStyles = {
  root: {
    borderRadius: 8,
    color: "var(--gk-text-sidebar)",
    "&[data-active]": { background: "var(--gk-bg-sidebar-active)", color: "#fff" },
  },
};

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "A").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Admin";

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
        <Box px={4} pb="sm">
          <GkLogo height={36} />
        </Box>
        <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />

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

        {/* User context at bottom */}
        <Stack gap={0} mt="auto">
          <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />
          <Group gap={4} px={4} mb={4}>
            <Badge size="xs" color="green" variant="dot" style={{ color: "var(--gk-text-sidebar)", opacity: 0.6 }}>
              {user?.node_id ?? "no-node"} · live
            </Badge>
          </Group>
          <Menu shadow="md" width={200} position="top">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%", borderRadius: 8, padding: "8px 6px" }}>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar size={36} color="blue" radius="xl">{initials}</Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--gk-text-sidebar)" truncate>{displayName}</Text>
                      <Text size="xs" c="var(--gk-text-sidebar)" opacity={0.55} truncate>node_manager</Text>
                    </Stack>
                  </Group>
                  <IconChevronUp size={14} color="var(--gk-text-sidebar)" style={{ opacity: 0.5, flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email ?? "node_manager"}</Menu.Label>
              <Menu.Item onClick={() => navigate("/admin/settings")}>Settings</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => { logout(); navigate("/login"); }}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Text size="xs" ta="center" py={6} style={{ color: "#000", opacity: 0.55 }}>
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
