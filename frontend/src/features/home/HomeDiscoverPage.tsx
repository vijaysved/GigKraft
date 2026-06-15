import {
  Badge,
  Card,
  Chip,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { GkBeforeAfter } from "../../components/GkBeforeAfter";
import { GkProofBadge } from "../../components/GkProofBadge";

const TRADES = ["All", "Plumber", "Electrician", "HVAC", "Carpenter", "Painter"];

const MOCK_PROS = [
  {
    id: 1, name: "John Smith", trade: "Plumber", verified: true,
    recs: 12, krafts: 8, avgResponse: "2h",
    tagline: "Licensed & insured. 10 years experience.",
    invoiceAmount: 280,
  },
  {
    id: 2, name: "Dave Torres", trade: "Electrician", verified: true,
    recs: 7, krafts: 5, avgResponse: "1.5h",
    tagline: "Panel upgrades, EV chargers, code compliance.",
    invoiceAmount: 450,
  },
  {
    id: 3, name: "Maria Garcia", trade: "HVAC", verified: true,
    recs: 20, krafts: 15, avgResponse: "3h",
    tagline: "Certified HVAC technician. Residential & commercial.",
    invoiceAmount: 600,
  },
  {
    id: 4, name: "Tom Wilson", trade: "Carpenter", verified: false,
    recs: 2, krafts: 3, avgResponse: "4h",
    tagline: "Custom woodwork and general carpentry.",
    invoiceAmount: 180,
  },
];

export function HomeDiscoverPage() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const navigate = useNavigate();

  const filtered = MOCK_PROS.filter((p) =>
    (tradeFilter === "All" || p.trade === tradeFilter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.trade.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Stack>
      <Title order={3}>Find a Pro</Title>

      <TextInput
        placeholder="Search by name or trade…"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        maw={480}
      />

      <Chip.Group value={tradeFilter} onChange={(v) => setTradeFilter(v as string)}>
        <Group gap="xs">
          {TRADES.map((t) => <Chip key={t} value={t} size="sm">{t}</Chip>)}
        </Group>
      </Chip.Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {filtered.map((pro) => (
          <Card
            key={pro.id}
            withBorder
            radius="md"
            padding="md"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/home/pros/${pro.id}`)}
          >
            <Stack gap="sm">
              <GkBeforeAfter height={100} />
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={700}>{pro.name}</Text>
                    {pro.verified && <Badge size="xs" color="green">Verified</Badge>}
                  </Group>
                  <Text size="sm" c="dimmed">{pro.trade}</Text>
                  <Text size="xs" c="dimmed">{pro.tagline}</Text>
                </Stack>
              </Group>
              <Group gap="xs">
                <GkProofBadge amount={pro.invoiceAmount} confirmed={pro.verified} />
                <Badge size="xs" variant="light">{pro.recs} reviews</Badge>
                <Badge size="xs" variant="light" color="blue">⚡ {pro.avgResponse}</Badge>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {filtered.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">No pros found for this filter.</Text>
      )}
    </Stack>
  );
}
