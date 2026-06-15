import {
  Badge,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";

import { GkEmptyState } from "../../components/GkEmptyState";

const MOCK_PROS = [
  { id: 1, name: "Dave Torres", trade: "Electrician", zip: "78701", krafts: 8, recs: 5, verified: true },
  { id: 2, name: "Maria Garcia", trade: "HVAC", zip: "78702", krafts: 14, recs: 11, verified: true },
  { id: 3, name: "Tom Wilson", trade: "Plumber", zip: "78703", krafts: 3, recs: 1, verified: false },
];

const TRADES = ["All trades", "Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "Roofer"];

export function ProNetworkPage() {
  const [trade, setTrade] = useState<string | null>("All trades");
  const [zip, setZip] = useState("");

  const filtered = MOCK_PROS.filter((p) =>
    (trade === "All trades" || p.trade === trade) &&
    (zip === "" || p.zip.startsWith(zip))
  );

  return (
    <Stack>
      <Title order={3}>Pro Network</Title>
      <Text size="sm" c="dimmed">Find other pros to refer work to or partner with.</Text>

      <Group gap="sm">
        <Select
          placeholder="Filter by trade"
          data={TRADES}
          value={trade}
          onChange={setTrade}
          w={200}
          clearable={false}
        />
        <TextInput
          placeholder="ZIP code"
          value={zip}
          onChange={(e) => setZip(e.currentTarget.value)}
          w={120}
        />
      </Group>

      {filtered.length === 0 ? (
        <GkEmptyState title="No pros found" description="Adjust filters to find pros in your area." />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {filtered.map((pro) => (
            <Card key={pro.id} withBorder radius="md" padding="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={700}>{pro.name}</Text>
                  {pro.verified && <Badge color="green" size="xs">Verified</Badge>}
                </Group>
                <Text size="sm" c="dimmed">{pro.trade} · {pro.zip}</Text>
                <Group gap="xs">
                  <Text size="xs">{pro.krafts} krafts</Text>
                  <Text size="xs">{pro.recs} recommendations</Text>
                </Group>
                <Button size="xs" variant="light" fullWidth>Connect</Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
