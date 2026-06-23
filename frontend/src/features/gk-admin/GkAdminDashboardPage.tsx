import {
  Alert,
  Anchor,
  Badge,
  Card,
  Group,
  Loader,
  Progress,
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
  listAnonymousLeads,
  type AnonLeadRow,
  type GkPlatformMetrics,
  type GkSiteTrafficRow,
} from "../../api/endpoints";
import { GkStatTile } from "../../components/GkStatTile";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function GkAdminDashboardPage() {
  const [metrics, setMetrics] = useState<GkPlatformMetrics | null>(null);
  const [anonLeads, setAnonLeads] = useState<AnonLeadRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [m, al] = await Promise.all([getGkPlatformMetrics(), listAnonymousLeads()]);
        if (!cancelled) { setMetrics(m); setAnonLeads(al); }
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

      {/* Anonymous captured leads */}
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Group justify="space-between">
            <Title order={4}>Anonymous Inquiries</Title>
            <Badge color="orange" size="sm" variant="light">{anonLeads.length} captured</Badge>
          </Group>
          <Text size="xs" c="dimmed">
            Visitors who filled the quote form but did not complete sign-up. The pro can already see these.
          </Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Captured</Table.Th>
                <Table.Th>Job</Table.Th>
                <Table.Th>Detail</Table.Th>
                <Table.Th>Pro</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {anonLeads.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text size="sm" c="dimmed">No anonymous inquiries yet.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {anonLeads.map((al) => (
                <Table.Tr key={al.id}>
                  <Table.Td><Text size="xs" c="dimmed">{fmtDate(al.created_at)}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{al.job_title}</Text></Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" lineClamp={2} style={{ maxWidth: 260 }}>
                      {al.detail || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{al.pro_name}</Text>
                    {al.pro_handle && (
                      <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        @{al.pro_handle}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color="gray" variant="outline">{al.status}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      {/* Platform Traffic */}
      {metrics && metrics.site_traffic.length > 0 && (
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Group justify="space-between">
              <Title order={4}>Platform Traffic</Title>
              <Text size="xs" c="dimmed">Demo &amp; marketing pages · unauthenticated visitors only</Text>
            </Group>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Page</Table.Th>
                  <Table.Th>Last 7 days</Table.Th>
                  <Table.Th>Last 30 days</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {metrics.site_traffic.map((row: GkSiteTrafficRow) => (
                  <Table.Tr key={row.url}>
                    <Table.Td>
                      <Text size="sm" fw={600}>{row.label}</Text>
                      <Anchor href={row.url} target="_blank" size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {row.url}
                      </Anchor>
                    </Table.Td>
                    <Table.Td><Text size="sm">{row.views_7d.toLocaleString()}</Text></Table.Td>
                    <Table.Td><Text size="sm">{row.views_30d.toLocaleString()}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Card>
      )}

      {/* Campaign Performance */}
      {metrics?.campaign && (
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={4}>Campaign Performance</Title>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              <GkStatTile label="Total Sent" value={metrics.campaign.total_sent} hint={`${metrics.campaign.sent_email} email · ${metrics.campaign.sent_whatsapp} WA · ${metrics.campaign.sent_sms} SMS`} />
              <GkStatTile label="Email Open Rate" value={`${metrics.campaign.open_rate}%`} hint={`${metrics.campaign.emails_opened} of ${metrics.campaign.sent_email} emails`} />
              <GkStatTile label="Link Click Rate" value={`${metrics.campaign.click_rate}%`} hint={`${metrics.campaign.links_clicked} clicks across all messages`} />
              <GkStatTile label="Conversion Rate" value={`${metrics.campaign.conversion_rate}%`} hint={`${metrics.campaign.converted} converted`} accent />
            </SimpleGrid>
            <Text size="xs" c="dimmed" fw={600}>Step Funnel</Text>
            <Stack gap={6}>
              {[1, 2, 3].map((step) => {
                const count = metrics.campaign.step_funnel[String(step)] ?? 0;
                const max = metrics.campaign.step_funnel["1"] ?? 1;
                return (
                  <Group key={step} gap="sm" align="center">
                    <Text size="xs" w={50} c="dimmed">Step {step}</Text>
                    <Progress value={max > 0 ? (count / max) * 100 : 0} size="sm" style={{ flex: 1 }} color="violet" />
                    <Text size="xs" w={30} ta="right">{count}</Text>
                  </Group>
                );
              })}
            </Stack>
          </Stack>
        </Card>
      )}

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
