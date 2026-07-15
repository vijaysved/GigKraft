import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { communityFetch } from "../hooks/useCommunity";
import type { CommunityAnalyticsOut } from "../types";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card withBorder radius="md" p="md">
      <Stack gap={2}>
        <Text size="xs" c="dimmed">{label}</Text>
        <Title order={3}>{value}</Title>
      </Stack>
    </Card>
  );
}

export function CommunityAnalyticsPanel() {
  const [data, setData] = useState<CommunityAnalyticsOut | null>(null);

  useEffect(() => {
    communityFetch("/api/me/community/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CommunityAnalyticsOut | null) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
      <StatTile label="Page views" value={data.page_views} />
      <StatTile label="Members" value={data.member_count} />
      <StatTile label="Joined" value={data.joined_count} />
      <StatTile label="Invited" value={data.invited_count} />
      <StatTile label="Pros" value={data.pro_count} />
      <StatTile label="Requests" value={data.requests_submitted} />
    </SimpleGrid>
  );
}
