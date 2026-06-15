import {
  Alert,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconShield } from "@tabler/icons-react";

export function GkAdminSafetyPage() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Platform Safety</Title>
        <Badge color="violet" variant="filled" size="sm">gk_admin</Badge>
      </Group>

      <Alert color="blue" variant="light" icon={<IconShield size={16} />}>
        Platform-wide safety view. Drill into individual node safety via the Node Manager console.
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder radius="md" padding="lg">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">Cross-node safety data</Text>
            <Text size="xs" c="dimmed">
              Use the Nodes page to open a specific node's admin console. Full infraction
              management is available per-node in the Node Manager view.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
