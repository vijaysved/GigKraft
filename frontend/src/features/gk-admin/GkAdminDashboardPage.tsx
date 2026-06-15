import {
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  ApiError,
  getGkPlatformMetrics,
  type GkPlatformMetrics,
} from "../../api/endpoints";
import { GkStatTile } from "../../components/GkStatTile";

export function GkAdminDashboardPage() {
  const [metrics, setMetrics] = useState<GkPlatformMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const m = await getGkPlatformMetrics();
        if (!cancelled) setMetrics(m);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load metrics.");
      }
    }
    void load();
    const timer = setInterval(() => { void load(); }, 60_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Platform Overview</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      {/* Users */}
      <Title order={5} c="dimmed">Users</Title>
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <GkStatTile label="Total Users" value={metrics?.total_users} accent />
        <GkStatTile label="Pros" value={metrics?.total_pros} hint="Service providers" />
        <GkStatTile label="Homeowners" value={metrics?.total_homeowners} />
        <GkStatTile label="Node Managers" value={metrics?.total_node_managers} />
      </SimpleGrid>

      {/* Platform */}
      <Title order={5} c="dimmed">Platform</Title>
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <GkStatTile label="Total Nodes" value={metrics?.total_nodes} hint={metrics ? `${metrics.active_nodes} active` : undefined} />
        <GkStatTile label="Verified Krafts" value={metrics?.verified_krafts} hint={metrics ? `of ${metrics.total_krafts} total` : undefined} />
        <GkStatTile label="Open Leads" value={metrics?.open_leads} hint={metrics ? `of ${metrics.total_leads} total` : undefined} />
        <GkStatTile label="Active Subscriptions" value={metrics?.active_subscriptions} hint={metrics ? `of ${metrics.total_subscriptions} total` : undefined} accent />
      </SimpleGrid>

      {/* Open infractions */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <GkStatTile label="Open Infractions" value={metrics?.open_infractions} hint="Platform-wide safety flags" />
      </SimpleGrid>

      {/* Nodes table */}
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Title order={4}>Nodes</Title>
          {metrics ? (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Node ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Active Pros</Table.Th>
                  <Table.Th>Pending Leads</Table.Th>
                  <Table.Th>Monthly Run Rate</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {metrics.nodes.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text size="sm" c="dimmed">No nodes found.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {metrics.nodes.map((node) => (
                  <Table.Tr key={node.node_id}>
                    <Table.Td>
                      <Text size="sm" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {node.node_id}
                      </Text>
                    </Table.Td>
                    <Table.Td><Text size="sm" fw={600}>{node.name}</Text></Table.Td>
                    <Table.Td><Text size="sm">{node.active_pros}</Text></Table.Td>
                    <Table.Td><Text size="sm">{node.pending_leads}</Text></Table.Td>
                    <Table.Td>
                      <Text size="sm">${node.monthly_run_rate.toFixed(0)}/mo</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={node.is_active ? "green" : "gray"} size="xs" variant="dot">
                        {node.is_active ? "active" : "inactive"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Loader size="sm" />
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
