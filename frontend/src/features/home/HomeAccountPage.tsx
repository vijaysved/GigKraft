import {
  Avatar,
  Badge,
  Card,
  Grid,
  Group,
  Stack,
  Switch,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconBell, IconMapPin, IconMessage, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";

export function HomeAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dispatchSms, setDispatchSms] = useState(true);
  const [dispatchEmail, setDispatchEmail] = useState(false);

  const LINKS = [
    { label: "Discover pros", icon: IconSearch, to: "/home/discover" },
    { label: "My messages", icon: IconMessage, to: "/home/messages" },
    { label: "Saved addresses", icon: IconMapPin, to: "/home/account/addresses" },
  ];

  return (
    <Stack>
      <Title order={3}>Your Account</Title>

      <Card withBorder radius="md" padding="lg">
        <Group>
          <Avatar size={64} color="teal" radius="xl">
            {(user?.first_name?.[0] ?? user?.email?.[0] ?? user?.phone?.[0] ?? "H").toUpperCase()}
          </Avatar>
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Homeowner"}
            </Text>
            <Text size="sm" c="dimmed">{user?.email ?? user?.phone ?? "—"}</Text>
            <Badge size="sm" variant="light">{user?.role ?? "homeowner"}</Badge>
          </Stack>
        </Group>
      </Card>

      <Grid>
        {LINKS.map(({ label, icon: Icon, to }) => (
          <Grid.Col key={to} span={{ base: 12, sm: 6, md: 4 }}>
            <UnstyledButton w="100%" onClick={() => navigate(to)}>
              <Card withBorder radius="md" padding="md" style={{ cursor: "pointer" }}>
                <Group gap="sm">
                  <Avatar radius="md" color="teal" size="md">
                    <Icon size={20} />
                  </Avatar>
                  <Text fw={600} size="sm">{label}</Text>
                </Group>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>

      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Group gap="xs">
            <IconBell size={18} />
            <Title order={5}>Dispatch notifications</Title>
          </Group>
          <Switch
            label="SMS alerts"
            description="Get text when a pro responds to your emergency"
            checked={dispatchSms}
            onChange={(e) => setDispatchSms(e.currentTarget.checked)}
          />
          <Switch
            label="Email alerts"
            description="Get email for quote updates and messages"
            checked={dispatchEmail}
            onChange={(e) => setDispatchEmail(e.currentTarget.checked)}
          />
        </Stack>
      </Card>

      <ThemeSettingsCard />
    </Stack>
  );
}
