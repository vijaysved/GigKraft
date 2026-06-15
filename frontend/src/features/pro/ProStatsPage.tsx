import {
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";

import { GkStatTile } from "../../components/GkStatTile";

type Range = "7d" | "30d" | "90d";

const MOCK_STATS: Record<Range, { leads: number; won: number; revenue: number; avgResponse: string; convRate: number }> = {
  "7d":  { leads: 4,  won: 2,  revenue: 480,  avgResponse: "1.8h", convRate: 50 },
  "30d": { leads: 18, won: 11, revenue: 2840, avgResponse: "2.1h", convRate: 61 },
  "90d": { leads: 52, won: 34, revenue: 9100, avgResponse: "2.4h", convRate: 65 },
};

export function ProStatsPage() {
  const [range, setRange] = useState<Range>("30d");
  const stats = MOCK_STATS[range];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Analytics</Title>
        <SegmentedControl
          value={range}
          onChange={(v) => setRange(v as Range)}
          data={[{ label: "7 days", value: "7d" }, { label: "30 days", value: "30d" }, { label: "90 days", value: "90d" }]}
          size="sm"
        />
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <GkStatTile label="Leads received" value={stats.leads} />
        <GkStatTile label="Jobs won" value={stats.won} />
        <GkStatTile label="Revenue" value={`$${stats.revenue.toLocaleString()}`} accent />
        <GkStatTile label="Avg response" value={stats.avgResponse} hint="Target: ≤ 4h" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={5}>Conversion rate</Title>
            <Text size="3rem" fw={800} style={{ fontFamily: "var(--mantine-font-family-monospace)", color: "var(--gk-accent-primary)" }}>
              {stats.convRate}%
            </Text>
            <Text size="sm" c="dimmed">{stats.won} won out of {stats.leads} leads</Text>
            <div style={{ height: 8, background: "var(--gk-border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stats.convRate}%`, background: "var(--gk-accent-primary)", borderRadius: 4 }} />
            </div>
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={5}>Revenue trend</Title>
            <Text size="sm" c="dimmed">Bar chart coming in Phase 2 with @mantine/charts</Text>
            <Group gap="xs" align="flex-end" style={{ height: 80 }}>
              {[40, 60, 30, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: "var(--gk-accent-primary)",
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.7 + (i / 7) * 0.3,
                  }}
                />
              ))}
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
