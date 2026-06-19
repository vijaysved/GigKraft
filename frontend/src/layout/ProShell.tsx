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
  IconChartBar,
  IconChevronUp,
  IconCreditCard,
  IconInbox,
  IconLogout,
  IconNetwork,
  IconPhoto,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../auth/AuthContext";
import { GkLogo } from "../brand/GkLogo";
import { useProAvatar } from "../hooks/useProAvatar";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconChartBar,  to: "/pro/dashboard" },
  { label: "Inbox",     icon: IconInbox,     to: "/pro/inbox" },
  { label: "Reviews",   icon: IconStar,      to: "/pro/reviews" },
  { label: "Krafts",    icon: IconPhoto,     to: "/pro/krafts" },
  { label: "Network",   icon: IconNetwork,   to: "/pro/network" },
  { label: "Billing",   icon: IconCreditCard, to: "/pro/billing" },
  { label: "Profile",   icon: IconUser,      to: "/pro/account" },
];

const navLinkStyles = (_theme: unknown, { active }: { active?: boolean }) => ({
  root: {
    borderRadius: 8,
    color: "var(--gk-text-sidebar)",
    ...(active ? { background: "var(--gk-bg-sidebar-active)", color: "#fff" } : {}),
  },
});

export function ProShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "P").toUpperCase();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Pro";
  const avatarSrc = useProAvatar();

  useEffect(() => {
    document.title = displayName !== "Pro" ? `${displayName} · gigkraft.com` : "GigKraft";
    return () => { document.title = "GigKraft"; };
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
            <NavLink
              key={to}
              component="button"
              label={label}
              leftSection={<Icon size={18} />}
              active={pathname.startsWith(to)}
              styles={navLinkStyles}
              onClick={() => navigate(to)}
            />
          ))}

        </Stack>

        {/* User context at bottom */}
        <Stack gap={0} mt="auto">
          <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />
          <Menu shadow="md" width={200} position="top">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%", borderRadius: 8, padding: "8px 6px" }}>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar size={36} src={avatarSrc} color="blue" radius="xl">{!avatarSrc && initials}</Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--gk-text-sidebar)" truncate>{displayName}</Text>
                      <Text size="xs" c="var(--gk-text-sidebar)" opacity={0.55} truncate>Pro</Text>
                    </Stack>
                  </Group>
                  <IconChevronUp size={14} color="var(--gk-text-sidebar)" style={{ opacity: 0.5, flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email ?? "pro"}</Menu.Label>
              <Menu.Item onClick={() => navigate("/pro/account?tab=public")}>My Profile</Menu.Item>
              <Menu.Item onClick={() => navigate("/pro/account?tab=settings")}>Account settings</Menu.Item>
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
