import {
  AppShell,
  Button,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { ThemeSelector } from "../theme/ThemeSelector";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>GigKraft</Title>
          <Group gap="sm">
            <ThemeSelector />
            {user && (
              <Text size="sm" c="dimmed">
                {user.email ?? user.phone ?? `user #${user.id}`}
              </Text>
            )}
            <Button variant="light" size="xs" onClick={logout}>
              Sign out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
