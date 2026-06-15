import {
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { GkEmptyState } from "../../components/GkEmptyState";
import { GkSegmentFilter } from "../../components/GkSegmentFilter";
import { GkSlaPill } from "../../components/GkSlaPill";

type Tab = "active" | "in_progress" | "archived";

const MOCK_LEADS = [
  {
    id: 1, status: "active", title: "Leaky faucet — kitchen",
    homeowner: "Sarah J.", budget: 150, trade: "Plumber",
    respondBy: new Date(Date.now() + 2 * 3600000).toISOString(),
    preview: "Hi, my kitchen faucet has been dripping for a week…",
  },
  {
    id: 2, status: "active", title: "Circuit breaker keeps tripping",
    homeowner: "Mark R.", budget: 300, trade: "Electrician",
    respondBy: new Date(Date.now() + 0.5 * 3600000).toISOString(),
    preview: "The main circuit trips every time we run the AC…",
  },
  {
    id: 3, status: "in_progress", title: "AC unit not cooling",
    homeowner: "Linda P.", budget: 500, trade: "HVAC",
    respondBy: new Date(Date.now() + 8 * 3600000).toISOString(),
    preview: "Quoted and accepted. Scheduling visit for tomorrow.",
  },
  {
    id: 4, status: "archived", title: "Replace water heater",
    homeowner: "Tom K.", budget: 1200, trade: "Plumber",
    respondBy: new Date(Date.now() - 2 * 3600000).toISOString(),
    preview: "Job completed. Invoice sent.",
  },
];

export function ProLeadsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const navigate = useNavigate();

  const leads = MOCK_LEADS.filter((l) => l.status === tab);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Leads</Title>
        <GkSegmentFilter
          value={tab}
          onChange={setTab}
          options={[
            { label: "Active", value: "active" },
            { label: "In progress", value: "in_progress" },
            { label: "Archived", value: "archived" },
          ]}
        />
      </Group>

      {leads.length === 0 ? (
        <GkEmptyState title={`No ${tab.replace("_", " ")} leads`} description="New leads will appear here." />
      ) : (
        <Stack gap="sm">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              withBorder
              radius="md"
              padding="md"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/pro/leads/${lead.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs">
                    <Text fw={700} truncate>{lead.title}</Text>
                    <Badge size="xs" variant="light">{lead.trade}</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">{lead.homeowner}</Text>
                  <Text size="sm" truncate c="dimmed">{lead.preview}</Text>
                </Stack>
                <Stack align="flex-end" gap="xs">
                  <GkSlaPill respondBy={lead.respondBy} />
                  <Text size="xs" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                    ${lead.budget}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
