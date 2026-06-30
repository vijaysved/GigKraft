import { Badge, Button, Card, Chip, Group, Loader, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconCheck, IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { addReferrerPro, getReferrerMe, getReferrerPros, searchProsPublic, type ProOut } from "../../../api/endpoints";

const TRADES = ["All", "Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "General Contractor"];

interface Props {
  onAdded: () => void;
}

export function ProSearchPanel({ onAdded }: Props) {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [zip, setZip] = useState("");
  const [pros, setPros] = useState<ProOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedHandles, setAddedHandles] = useState<Set<string>>(new Set());
  const [addingHandle, setAddingHandle] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Customized for this referrer: default the search to their own service zip,
  // and mark pros already on their page so they're not offered twice.
  useEffect(() => {
    getReferrerMe().then((data) => {
      if (data.profile.default_zip) setZip(data.profile.default_zip);
    }).catch(() => {});
    void refreshAdded();
  }, []);

  async function refreshAdded() {
    try {
      const rows = await getReferrerPros();
      setAddedHandles(new Set(rows.filter((r) => r.handle).map((r) => r.handle as string)));
    } catch {
      // leave previous state
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchProsPublic({
        q: search || undefined,
        trade: tradeFilter !== "All" ? tradeFilter : undefined,
        zip: zip || undefined,
      })
        .then(setPros)
        .catch(() => setPros([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, tradeFilter, zip]);

  async function handleAdd(pro: ProOut) {
    if (!pro.handle) return;
    setAddingHandle(pro.handle);
    try {
      const res = await addReferrerPro(pro.handle);
      if (res.ok || res.status === 409) {
        setAddedHandles((prev) => new Set(prev).add(pro.handle as string));
        onAdded();
      }
    } finally {
      setAddingHandle(null);
    }
  }

  return (
    <Stack gap="sm">
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Search by name or trade…"
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <TextInput
          placeholder="Zip"
          description={zip ? undefined : "Defaults to your service area"}
          value={zip}
          onChange={(e) => setZip(e.currentTarget.value)}
          w={110}
        />
      </Group>

      <Chip.Group value={tradeFilter} onChange={(v) => setTradeFilter(v as string)}>
        <Group gap="xs">
          {TRADES.map((t) => <Chip key={t} value={t} size="sm">{t}</Chip>)}
        </Group>
      </Chip.Group>

      {loading ? (
        <Loader size="sm" />
      ) : pros.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">No pros found. Try a different search, trade, or zip.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {pros.map((pro) => {
            const added = !!pro.handle && addedHandles.has(pro.handle);
            return (
              <Card key={pro.id} withBorder radius="md" padding="sm">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Group gap={6} wrap="nowrap">
                      <Text fw={700} size="sm" truncate>{pro.name}</Text>
                      {pro.is_verified && <Badge size="xs" color="green">Verified</Badge>}
                    </Group>
                    <Text size="xs" c="dimmed">{pro.primary_trade || "General"}</Text>
                    {pro.bio && <Text size="xs" c="dimmed" lineClamp={2}>{pro.bio}</Text>}
                    <Group gap={6} mt={4}>
                      {pro.stats.recs_approved > 0 && (
                        <Badge size="xs" variant="light">{pro.stats.recs_approved} reviews</Badge>
                      )}
                      {pro.response_hours > 0 && (
                        <Badge size="xs" variant="light" color="blue">⚡ {pro.response_hours}h avg</Badge>
                      )}
                    </Group>
                  </Stack>
                  <Button
                    size="xs"
                    radius="xl"
                    variant={added ? "light" : "filled"}
                    color={added ? "teal" : undefined}
                    disabled={added}
                    loading={addingHandle === pro.handle}
                    leftSection={added ? <IconCheck size={13} /> : <IconPlus size={13} />}
                    onClick={() => void handleAdd(pro)}
                    style={!added ? { background: "var(--gk-brand-gradient)", color: "#fff", flexShrink: 0 } : { flexShrink: 0 }}
                  >
                    {added ? "Added" : "Add"}
                  </Button>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
