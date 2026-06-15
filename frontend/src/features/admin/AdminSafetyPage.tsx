import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { GkEmptyState } from "../../components/GkEmptyState";

// Placeholder until backend endpoint is live (spec: PENDING)
const MOCK_LOGS = [
  { id: 1, profile: "Pro #42 — John Smith", infraction: "No-show (3rd)", severity: "high" },
  { id: 2, profile: "Pro #17 — Dave Torres", infraction: "Fake invoice claim", severity: "critical" },
  { id: 3, profile: "Pro #88 — Mike Lee", infraction: "Late response pattern", severity: "low" },
];

const SEVERITY_COLOR: Record<string, string> = {
  low: "yellow",
  medium: "orange",
  high: "red",
  critical: "red",
};

export function AdminSafetyPage() {
  return (
    <Stack>
      <Title order={3}>Safety & Hygiene</Title>
      <Text size="sm" c="dimmed">Backend endpoint pending — showing seed data.</Text>

      {MOCK_LOGS.length === 0 ? (
        <GkEmptyState title="No open safety logs" description="All clear." />
      ) : (
        <Stack gap="sm">
          {MOCK_LOGS.map((log) => (
            <Card key={log.id} withBorder radius="md" padding="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600}>{log.profile}</Text>
                  <Text size="sm">{log.infraction}</Text>
                </Stack>
                <Group gap="xs">
                  <Badge color={SEVERITY_COLOR[log.severity] ?? "gray"}>
                    {log.severity}
                  </Badge>
                  <Button size="xs" variant="light" color="gray">Dismiss</Button>
                  <Button size="xs" color="red" variant="light">Suspend</Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
