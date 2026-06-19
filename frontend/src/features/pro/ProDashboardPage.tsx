import {
  Badge,
  Box,
  Card,
  Center,
  Group,
  Loader,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { getProDashboard, getProMarket, type DashboardData, type MarketData } from "../../api/endpoints";

type Range = "7d" | "30d" | "90d";

const RANGE_OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

// ── Shared helpers ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={700}
      tt="uppercase"
      style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}
    >
      {children}
    </Text>
  );
}

function GkCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)" }}
    >
      {children}
    </Card>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ joinedAt }: { joinedAt: string }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="md" maw={400}>
        <ThemeIcon size={64} radius="xl" variant="light" color="blue" style={{ background: "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)" }}>
          <IconChartBar size={32} style={{ color: "var(--gk-accent-primary)" }} />
        </ThemeIcon>
        <Stack gap={4} align="center">
          <Title order={4} ta="center">Time to build your presence</Title>
          <Text size="sm" c="dimmed" ta="center">
            Share your profile link to start collecting visitors and project requests.
            Data will appear here as activity comes in.
          </Text>
        </Stack>
        <Text size="xs" c="dimmed" style={{ color: "var(--gk-accent-primary)", opacity: 0.7 }}>
          Member since {joinedAt}
        </Text>
      </Stack>
    </Center>
  );
}

// ── Funnel metric card ──────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  deltaPct: number;
}

function MetricCard({ label, value, deltaPct }: MetricCardProps) {
  const isPositive = deltaPct >= 0;
  const sign = isPositive ? "+" : "";

  return (
    <GkCard>
      <Stack gap={4}>
        <SectionLabel>{label}</SectionLabel>
        <Text fw={800} size="2rem" style={{ fontFamily: "var(--mantine-font-family-monospace)", color: "var(--gk-accent-primary)", lineHeight: 1 }}>
          {value.toLocaleString()}
        </Text>
        <Badge
          variant="light"
          color={isPositive ? "green" : "red"}
          size="sm"
          radius="sm"
        >
          {sign}{deltaPct}% vs prior period
        </Badge>
      </Stack>
    </GkCard>
  );
}

// ── Bar chart ───────────────────────────────────────────────────────────────

function TimelineChart({ data }: { data: { label: string; visitors: number; requests: number }[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.visitors, d.requests]), 1);

  return (
    <Stack gap="xs">
      <Group gap="lg">
        <Group gap={6}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--gk-accent-primary)" }} />
          <Text size="xs" c="dimmed">Visitors</Text>
        </Group>
        <Group gap={6}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--gk-accent-secondary)" }} />
          <Text size="xs" c="dimmed">Requests</Text>
        </Group>
      </Group>
      <Box style={{ overflowX: "auto" }}>
        <Group align="flex-end" gap={4} wrap="nowrap" style={{ minWidth: data.length * 48, height: 120 }}>
          {data.map((pt) => (
            <Stack key={pt.label} align="center" gap={4} style={{ flex: 1, minWidth: 40 }}>
              <Group align="flex-end" gap={2} style={{ height: 90 }}>
                <div
                  style={{
                    width: 14,
                    height: Math.max(4, (pt.visitors / maxVal) * 90),
                    background: "var(--gk-accent-primary)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
                <div
                  style={{
                    width: 14,
                    height: Math.max(4, (pt.requests / maxVal) * 90),
                    background: "var(--gk-accent-secondary, #7c3aed)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              </Group>
              <Text size="10px" c="dimmed" ta="center">{pt.label}</Text>
            </Stack>
          ))}
        </Group>
      </Box>
    </Stack>
  );
}

// ── Tab 1: My Performance ──────────────────────────────────────────────────

function MyPerformanceTab() {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProDashboard(range)
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <Stack gap="lg">
      <Group justify="flex-end">
        <SegmentedControl
          value={range}
          onChange={(v) => setRange(v as Range)}
          data={RANGE_OPTIONS}
          size="sm"
          color="var(--gk-accent-primary)"
        />
      </Group>

      {loading && <Center py="xl"><Loader /></Center>}

      {data && data.total_visitors === 0 && data.project_requests === 0 && (
        <EmptyState joinedAt={data.joined_at} />
      )}

      {data && (data.total_visitors > 0 || data.project_requests > 0) && (
        <Stack gap="lg">
          {/* Funnel cards */}
          <Stack gap="xs">
            <SectionLabel>Funnel Overview</SectionLabel>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <MetricCard label="Total Page Visitors" value={data.total_visitors} deltaPct={data.visitors_delta_pct} />
              <MetricCard label="Neighbors" value={data.neighbors} deltaPct={data.neighbors_delta_pct} />
              <MetricCard label="Project Requests" value={data.project_requests} deltaPct={data.requests_delta_pct} />
            </SimpleGrid>
          </Stack>

          {/* Conversion rate */}
          <GkCard>
            <Stack gap="xs">
              <SectionLabel>Conversion Rate</SectionLabel>
              <Group align="center" gap="lg">
                <Text fw={800} size="2.4rem" style={{ fontFamily: "var(--mantine-font-family-monospace)", color: "var(--gk-accent-primary)", lineHeight: 1 }}>
                  {data.conversion_pct}%
                </Text>
                <Text size="sm" c="dimmed">
                  {data.project_requests} requests from {data.total_visitors} visitors
                </Text>
              </Group>
              <div style={{ height: 8, background: "var(--gk-border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(data.conversion_pct, 100)}%`, background: "var(--gk-accent-primary)", borderRadius: 4 }} />
              </div>
            </Stack>
          </GkCard>

          {/* Timeline bar chart */}
          <GkCard>
            <Stack gap="md">
              <SectionLabel>Visitors vs Requests Over Time</SectionLabel>
              {data.timeline.length === 0 ? (
                <Text size="sm" c="dimmed">No data yet for this period.</Text>
              ) : (
                <TimelineChart data={data.timeline} />
              )}
            </Stack>
          </GkCard>

          {/* Per-Kraft engagement table */}
          <GkCard>
            <Stack gap="md">
              <SectionLabel>Portfolio Engagement</SectionLabel>
              {data.krafts.length === 0 ? (
                <Text size="sm" c="dimmed">No Krafts yet. Add portfolio items to track engagement.</Text>
              ) : (
                <Box style={{ overflowX: "auto" }}>
                  <Table striped highlightOnHover style={{ fontSize: "var(--mantine-font-size-sm)" }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Kraft</Table.Th>
                        <Table.Th ta="right">Impressions</Table.Th>
                        <Table.Th ta="right">Clicks</Table.Th>
                        <Table.Th ta="right">CTR</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.krafts.map((k) => (
                        <Table.Tr key={k.kraft_id}>
                          <Table.Td>{k.title}</Table.Td>
                          <Table.Td ta="right">{k.impressions}</Table.Td>
                          <Table.Td ta="right">{k.clicks}</Table.Td>
                          <Table.Td ta="right">
                            <Badge variant="light" color={k.ctr_pct >= 20 ? "green" : k.ctr_pct >= 5 ? "yellow" : "gray"} size="sm">
                              {k.ctr_pct}%
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              )}
            </Stack>
          </GkCard>
        </Stack>
      )}
    </Stack>
  );
}

// ── Tab 2: Market & Comparison ─────────────────────────────────────────────

function MarketTab() {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProMarket(range)
      .then(setData)
      .catch(() => setError("Failed to load market data."))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <Stack gap="lg">
      <Group justify="flex-end">
        <SegmentedControl
          value={range}
          onChange={(v) => setRange(v as Range)}
          data={RANGE_OPTIONS}
          size="sm"
          color="var(--gk-accent-primary)"
        />
      </Group>

      {loading && <Center py="xl"><Loader /></Center>}

      {data && data.zip_breakdown.length === 0 && !data.market_share.available && (
        <EmptyState joinedAt={data.joined_at} />
      )}

      {data && (data.zip_breakdown.length > 0 || data.market_share.available) && (
        <Stack gap="lg">
          {/* Geographic Breakdown */}
          <GkCard>
            <Stack gap="md">
              <SectionLabel>Visitors by Zip Code</SectionLabel>
              {data.zip_breakdown.length === 0 ? (
                <Text size="sm" c="dimmed">No geo data yet. Visitors who are logged in and have a zip code set will appear here.</Text>
              ) : (
                <Box style={{ overflowX: "auto" }}>
                  <Table striped highlightOnHover style={{ fontSize: "var(--mantine-font-size-sm)" }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Zip Code</Table.Th>
                        <Table.Th ta="right">Visitors</Table.Th>
                        <Table.Th ta="right">Requests</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.zip_breakdown.map((row) => (
                        <Table.Tr key={row.zip}>
                          <Table.Td>{row.zip}</Table.Td>
                          <Table.Td ta="right">{row.visitors}</Table.Td>
                          <Table.Td ta="right">{row.requests}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              )}
            </Stack>
          </GkCard>

          {/* Market Share */}
          <GkCard>
            <Stack gap="md">
              <SectionLabel>Market Share Benchmark</SectionLabel>
              {data.market_share.available ? (
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Compared to {data.market_share.pro_count} other pros in your zip + trade
                  </Text>
                  <SimpleGrid cols={2}>
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>You</Text>
                      <Text fw={800} size="1.8rem" style={{ color: "var(--gk-accent-primary)", fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {data.market_share.my_lead_pct}%
                      </Text>
                      <Text size="xs" c="dimmed">of area leads</Text>
                    </Stack>
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Area Average</Text>
                      <Text fw={800} size="1.8rem" style={{ color: "var(--gk-border)", fontFamily: "var(--mantine-font-family-monospace)" }}>
                        {data.market_share.avg_lead_pct}%
                      </Text>
                      <Text size="xs" c="dimmed">per pro</Text>
                    </Stack>
                  </SimpleGrid>
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>You</Text>
                    <div style={{ height: 8, background: "var(--gk-border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(data.market_share.my_lead_pct, 100)}%`, background: "var(--gk-accent-primary)", borderRadius: 4 }} />
                    </div>
                    <Text size="xs" c="dimmed" mt={8} mb={4}>Area Average</Text>
                    <div style={{ height: 8, background: "var(--gk-border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(data.market_share.avg_lead_pct, 100)}%`, background: "var(--gk-accent-secondary, #7c3aed)", borderRadius: 4 }} />
                    </div>
                  </Box>
                </Stack>
              ) : (
                <Stack gap="xs">
                  <Badge variant="outline" color="gray" size="lg">Coming Soon</Badge>
                  <Text size="sm" c="dimmed">
                    {data.market_share.pro_count} of {data.market_share.required_count} pros needed in your area to unlock benchmarks.
                    Invite more pros to GigKraft to speed this up.
                  </Text>
                </Stack>
              )}
            </Stack>
          </GkCard>
        </Stack>
      )}
    </Stack>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export function ProDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("performance");

  return (
    <Stack maw={860}>
      <Title order={3}>Dashboard</Title>

      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v ?? "performance")}
        color="var(--gk-accent-primary)"
      >
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab value="performance" style={{ color: activeTab === "performance" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            My Performance
          </Tabs.Tab>
          <Tabs.Tab value="market" style={{ color: activeTab === "market" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Market & Comparison
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="performance" pt="lg">
          <MyPerformanceTab />
        </Tabs.Panel>

        <Tabs.Panel value="market" pt="lg">
          <MarketTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
