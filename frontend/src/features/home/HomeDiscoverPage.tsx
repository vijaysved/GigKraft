import {
  Badge,
  Card,
  Chip,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { searchPros, type ProOut } from "../../api/endpoints";
import { GkBeforeAfter } from "../../components/GkBeforeAfter";
import { GkProofBadge } from "../../components/GkProofBadge";

const TRADES = ["All", "Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "General Contractor"];

export function HomeDiscoverPage() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [pros, setPros] = useState<ProOut[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchPros({
        q: search || undefined,
        trade: tradeFilter !== "All" ? tradeFilter : undefined,
      })
        .then(setPros)
        .catch(() => setPros([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, tradeFilter]);

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

      {loading && <Loader size="sm" />}

      {!loading && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {pros.map((pro) => (
            <Card
              key={pro.id}
              withBorder
              radius="md"
              padding="md"
              style={{ cursor: "pointer" }}
              onClick={() => pro.handle && navigate(`/pros/${pro.handle}`)}
            >
              <Stack gap="sm">
                <GkBeforeAfter height={100} />
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={700}>{pro.name}</Text>
                      {pro.is_verified && <Badge size="xs" color="green">Verified</Badge>}
                    </Group>
                    <Text size="sm" c="dimmed">{pro.primary_trade || "General"}</Text>
                    {pro.bio && <Text size="xs" c="dimmed" lineClamp={2}>{pro.bio}</Text>}
                  </Stack>
                </Group>
                <Group gap="xs">
                  <GkProofBadge amount={200} confirmed={pro.is_verified} />
                  {pro.stats.recs_approved > 0 && (
                    <Badge size="xs" variant="light">{pro.stats.recs_approved} reviews</Badge>
                  )}
                  {pro.response_hours > 0 && (
                    <Badge size="xs" variant="light" color="blue">⚡ {pro.response_hours}h avg</Badge>
                  )}
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {!loading && pros.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">No pros found. Try a different search or trade.</Text>
      )}
    </Stack>
  );
}
