import {
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  CopyButton,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconActivity,
  IconCopy,
  IconExternalLink,
  IconSend,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { getAccessToken } from "../../api/tokens";
import type { ReferrerDashboardOut, ReferrerProDashboardOut } from "./types";
import { MyProsTab } from "./tabs/MyProsTab";
import { RequestsTab } from "./tabs/RequestsTab";
import { FollowersTab } from "./tabs/FollowersTab";
import { ActivityTab } from "./tabs/ActivityTab";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const TAB_PATHS: Record<string, string> = {
  pros: "/us/me/refer",
  requests: "/us/me/requests",
  followers: "/us/me/followers",
  activity: "/us/me/activity",
};

const PATH_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([k, v]) => [v, k])
);

export function ReferrerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = PATH_TO_TAB[location.pathname] ?? "pros";

  const [dashboard, setDashboard] = useState<ReferrerDashboardOut | null>(null);
  const [pros, setPros] = useState<ReferrerProDashboardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/referrer/me`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/referrer/me/pros`, { headers: authHeaders() }),
      ]);
      if (dRes.ok) setDashboard(await dRes.json() as ReferrerDashboardOut);
      if (pRes.ok) setPros(await pRes.json() as ReferrerProDashboardOut[]);
    } catch {
      setError("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <Center h="60vh"><Loader /></Center>;
  if (error || !dashboard) return <Alert color="red" variant="light">{error ?? "Error"}</Alert>;

  const pageUrl = `gigkraft.com/us/${dashboard.profile.slug}/refer`;
  const fullUrl = `https://gigkraft.com/us/${dashboard.profile.slug}/refer`;

  return (
    <Stack gap="lg" p="md">
      {/* Page header */}
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Title order={3}>My Referrer Page</Title>
          <Group gap={4}>
            <Text size="sm" c="dimmed">{pageUrl}</Text>
            <CopyButton value={fullUrl}>
              {({ copy, copied }) => (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  leftSection={<IconCopy size={12} />}
                  onClick={copy}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </CopyButton>
            <Anchor href={fullUrl} target="_blank" size="xs">
              <IconExternalLink size={12} />
            </Anchor>
          </Group>
        </Stack>
      </Group>

      {/* Stats */}
      <SimpleGrid cols={{ base: 3 }} spacing="sm">
        <Stack
          gap={2}
          align="center"
          p="sm"
          style={{ background: "var(--mantine-color-gray-0)", borderRadius: 8, border: "1px solid var(--mantine-color-gray-3)" }}
        >
          <IconUsers size={20} color="var(--mantine-color-teal-6)" />
          <Text fw={700} size="xl">{dashboard.stats.follower_count}</Text>
          <Text size="xs" c="dimmed">Followers</Text>
        </Stack>
        <Stack
          gap={2}
          align="center"
          p="sm"
          style={{ background: "var(--mantine-color-gray-0)", borderRadius: 8, border: "1px solid var(--mantine-color-gray-3)" }}
        >
          <IconSend size={20} color="var(--mantine-color-yellow-6)" />
          <Text fw={700} size="xl">{dashboard.stats.pending_request_count}</Text>
          <Text size="xs" c="dimmed">Pending requests</Text>
        </Stack>
        <Stack
          gap={2}
          align="center"
          p="sm"
          style={{ background: "var(--mantine-color-gray-0)", borderRadius: 8, border: "1px solid var(--mantine-color-gray-3)" }}
        >
          <IconActivity size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="xl">{dashboard.stats.referral_count}</Text>
          <Text size="xs" c="dimmed">Referrals sent</Text>
        </Stack>
      </SimpleGrid>

      <Divider />

      <Tabs
        value={activeTab}
        onChange={(val) => val && navigate(TAB_PATHS[val] ?? "/us/me/refer")}
      >
        <Tabs.List>
          <Tabs.Tab value="pros">My Pros</Tabs.Tab>
          <Tabs.Tab value="requests">
            Requests
            {dashboard.stats.pending_request_count > 0 && (
              <Badge size="xs" color="red" variant="filled" ml={6}>{dashboard.stats.pending_request_count}</Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="followers">Followers</Tabs.Tab>
          <Tabs.Tab value="activity">Activity</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pros" pt="md">
          <MyProsTab />
        </Tabs.Panel>
        <Tabs.Panel value="requests" pt="md">
          <RequestsTab pros={pros} />
        </Tabs.Panel>
        <Tabs.Panel value="followers" pt="md">
          <FollowersTab />
        </Tabs.Panel>
        <Tabs.Panel value="activity" pt="md">
          <ActivityTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
