import {
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  ApiError,
  getGkNodes,
  type GkNodeSummary,
} from "../../api/endpoints";

export function GkAdminNodesPage() {
  const [nodes, setNodes] = useState<GkNodeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const rows = await getGkNodes();
        if (!cancelled) setNodes(rows);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load nodes.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>All Nodes</Title>
        <Badge color="violet" variant="filled" size="sm">{nodes?.length ?? "…"} nodes</Badge>
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      {nodes ? (
        nodes.length === 0 ? (
          <Text c="dimmed" size="sm">No nodes configured.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {nodes.map((node) => (
              <Card key={node.node_id} withBorder radius="md" padding="lg">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={700} size="md">{node.name}</Text>
                    <Badge color={node.is_active ? "green" : "gray"} size="xs" variant="dot">
                      {node.is_active ? "active" : "inactive"}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    {node.node_id}
                  </Text>
                  <SimpleGrid cols={3} mt="xs">
                    <Stack gap={2} align="center">
                      <Text fw={700} size="xl" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {node.active_pros}
                      </Text>
                      <Text size="xs" c="dimmed">Active Pros</Text>
                    </Stack>
                    <Stack gap={2} align="center">
                      <Text fw={700} size="xl" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {node.pending_leads}
                      </Text>
                      <Text size="xs" c="dimmed">Pending Leads</Text>
                    </Stack>
                    <Stack gap={2} align="center">
                      <Text fw={700} size="xl" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        ${node.monthly_run_rate.toFixed(0)}
                      </Text>
                      <Text size="xs" c="dimmed">Run Rate/mo</Text>
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )
      ) : (
        <Loader size="sm" />
      )}
    </Stack>
  );
}
