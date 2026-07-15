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
import { loadGooglePictureUrl, useProAvatar } from "../hooks/useProAvatar";
import {
  IconChevronUp,
  IconExternalLink,
  IconHome,
  IconInbox,
  IconLogout,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../auth/AuthContext";
import { GkLogo } from "../brand/GkLogo";
import { formatPhone } from "../utils/format";

export function ReferrerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "R").toUpperCase();
  const avatarSrc = useProAvatar() || loadGooglePictureUrl() || undefined;
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "You";

  const NAV_ITEMS = [
    { label: "Home", icon: IconHome, to: `/us/${slug}/home` },
    { label: "Inbox", icon: IconInbox, to: `/us/${slug}/inbox` },
    { label: "Community", icon: IconUsersGroup, to: `/us/${slug}/community` },
    { label: "Account", icon: IconUser, to: `/us/${slug}/account` },
  ];

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
        <Box px={4} pb="sm">
          <GkLogo height={36} />
        </Box>
        <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />

        <Stack gap={4} style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <RouterNavLink key={to} to={to} end style={{ textDecoration: "none" }}>
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

          <Divider style={{ borderColor: "var(--gk-border)" }} my={4} />

          <a
            href={`/us/${slug}/refer`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <NavLink
              component="div"
              label="Your Page"
              leftSection={<IconExternalLink size={18} />}
              style={{
                borderRadius: 8,
                color: "var(--gk-text-sidebar)",
              }}
            />
          </a>
        </Stack>

        <Stack gap={0} mt="auto">
          <Divider style={{ borderColor: "var(--gk-border)" }} mb="xs" />
          <Menu shadow="md" width={200} position="top">
            <Menu.Target>
              <UnstyledButton style={{ width: "100%", borderRadius: 8, padding: "8px 6px" }}>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar size={36} src={avatarSrc} color="teal" radius="xl">{!avatarSrc && initials}</Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--gk-text-sidebar)" truncate>{displayName}</Text>
                      <Text size="xs" c="var(--gk-text-sidebar)" opacity={0.55} truncate>Referrer</Text>
                    </Stack>
                  </Group>
                  <IconChevronUp size={14} color="var(--gk-text-sidebar)" style={{ opacity: 0.5, flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email ?? (user?.phone ? formatPhone(user.phone) : "referrer")}</Menu.Label>
              <Menu.Item onClick={() => navigate(`/us/${slug}/account`)}>Account</Menu.Item>
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
