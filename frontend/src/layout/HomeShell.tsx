import {
  AppShell,
  Avatar,
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
  IconAlertOctagon,
  IconChevronUp,
  IconCircles,
  IconLogout,
  IconMessage,
  IconSearch,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../auth/AuthContext";
import { GkLogo } from "../brand/GkLogo";
import { useProAvatar } from "../hooks/useProAvatar";

const NAV_ITEMS = [
  { label: "Discover", icon: IconSearch, to: "/home/discover" },
  { label: "Messages", icon: IconMessage, to: "/home/messages" },
  { label: "My Circle", icon: IconCircles, to: "/home/circle" },
  { label: "Recommend", icon: IconStar, to: "/home/recommend" },
  { label: "You", icon: IconUser, to: "/home/account" },
];


export function HomeShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatarSrc = useProAvatar();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? user?.phone?.[0] ?? "H").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || user?.phone || "You";

  useEffect(() => {
    document.title = displayName !== "You" ? `${displayName} · gigKraft.com` : "gigKraft.com";
    return () => { document.title = "gigKraft.com"; };
  }, [displayName]);

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
                <NavLink
                  component="div"
                  label={label}
                  leftSection={<Icon size={18} />}
                  active={isActive}
                  style={{
                    borderRadius: 8,
                    color: isActive ? "#fff" : "var(--gk-text-sidebar)",
                    background: isActive ? "var(--gk-bg-sidebar-active)" : undefined,
                  }}
                />
              )}
            </RouterNavLink>
          ))}

          <RouterNavLink to="/home/emergency" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <NavLink
                component="div"
                label="Emergency"
                leftSection={<IconAlertOctagon size={18} />}
                active={isActive}
                mt={8}
                style={{
                  borderRadius: 8,
                  background: isActive ? "#C0392B" : "#E74C3C",
                  color: "#fff",
                  fontWeight: 700,
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
                    <Avatar size={36} src={avatarSrc ?? undefined} color="teal" radius="xl">{!avatarSrc && initials}</Avatar>
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
