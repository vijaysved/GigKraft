import {
  AppShell,
  Avatar,
  Divider,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertOctagon,
  IconChevronUp,
  IconLogout,
  IconMessage,
  IconSearch,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
  { label: "Discover", icon: IconSearch, to: "/home/discover" },
  { label: "Messages", icon: IconMessage, to: "/home/messages" },
  { label: "Recommend", icon: IconStar, to: "/home/recommend" },
  { label: "You", icon: IconUser, to: "/home/account" },
];

const navLinkStyles = {
  root: {
    borderRadius: 8,
    color: "var(--gk-text-sidebar)",
    "&[data-active]": { background: "var(--gk-bg-sidebar-active)", color: "#fff" },
  },
};

export function HomeShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? user?.phone?.[0] ?? "H").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || user?.phone || "You";

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
        {/* Nav items */}
        <Stack gap={4} style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <RouterNavLink key={to} to={to} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <NavLink label={label} leftSection={<Icon size={18} />} active={isActive} styles={navLinkStyles} />
              )}
            </RouterNavLink>
          ))}

          <RouterNavLink to="/home/emergency" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <NavLink
                label="Emergency"
                leftSection={<IconAlertOctagon size={18} />}
                active={isActive}
                mt={8}
                styles={{
                  root: {
                    borderRadius: 8,
                    background: isActive ? "#C0392B" : "#E74C3C",
                    color: "#fff",
                    fontWeight: 700,
                  },
                }}
              />
            )}
          </RouterNavLink>
        </Stack>

        {/* User context at bottom */}
        <Stack gap={0} mt="auto">
          <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />
          <Menu shadow="md" width={200} position="top">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%", borderRadius: 8, padding: "8px 6px" }}>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar size={36} color="teal" radius="xl">{initials}</Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--gk-text-sidebar)" truncate>{displayName}</Text>
                      <Text size="xs" c="var(--gk-text-sidebar)" opacity={0.55} truncate>Homeowner</Text>
                    </Stack>
                  </Group>
                  <IconChevronUp size={14} color="var(--gk-text-sidebar)" style={{ opacity: 0.5, flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email ?? user?.phone ?? "homeowner"}</Menu.Label>
              <Menu.Item onClick={() => navigate("/home/account")}>Account</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => { logout(); navigate("/login"); }}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "var(--gk-bg-canvas)" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
