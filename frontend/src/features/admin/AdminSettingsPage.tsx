import {
  Button,
  Card,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";

export function AdminSettingsPage() {
  const [autoBlast, setAutoBlast] = useState(true);
  const [escalation, setEscalation] = useState(true);
  const [sla, setSla] = useState("4h");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Stack>
      <Title order={3}>Node Settings & Billing</Title>

      <ThemeSettingsCard />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={4}>Node configuration</Title>
            <Switch
              label="Auto-blast emergencies"
              description="Send WhatsApp blast automatically when emergency arrives"
              checked={autoBlast}
              onChange={(e) => setAutoBlast(e.currentTarget.checked)}
            />
            <Switch
              label="15-min escalation"
              description="Escalate to next-tier pros after 15 minutes unrouted"
              checked={escalation}
              onChange={(e) => setEscalation(e.currentTarget.checked)}
            />
            <Select
              label="Default response SLA"
              value={sla}
              onChange={(v) => { if (v) setSla(v); }}
              data={[
                { value: "1h", label: "1 hour" },
                { value: "2h", label: "2 hours" },
                { value: "4h", label: "4 hours" },
                { value: "8h", label: "8 hours" },
              ]}
            />
            <Button onClick={handleSave} color={saved ? "green" : undefined}>
              {saved ? "Saved!" : "Save settings"}
            </Button>
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack>
            <Title order={4}>Billing overview</Title>
            <Text size="xl" fw={800} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
              $0.00
            </Text>
            <Text size="sm" c="dimmed">Monthly run rate</Text>
            <Divider />
            <Stack gap="xs">
              {["Pro subscriptions", "Vault upgrades", "Emergency dispatch fees"].map((item) => (
                <Group key={item} justify="space-between">
                  <Text size="sm">{item}</Text>
                  <Text size="sm" fw={600} style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>$0.00</Text>
                </Group>
              ))}
            </Stack>
            <Button variant="light" size="sm">Export CSV</Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
