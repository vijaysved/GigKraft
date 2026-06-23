import {
  Badge,
  Box,
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
import { IconMapPin, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { searchProsPublic, trackSitePageView, type ProOut } from "../api/endpoints";

const TRADES = ["All", "Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "General Contractor"];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [tradeFilter, setTradeFilter] = useState(searchParams.get("trade") ?? "All");
  const [zipFilter, setZipFilter] = useState(searchParams.get("zip") ?? "");
  const [pros, setPros] = useState<ProOut[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track this as a site page view
  useEffect(() => {
    trackSitePageView(window.location.href);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Sync URL params so the search is shareable
      const params: Record<string, string> = {};
      if (query) params.q = query;
      if (tradeFilter !== "All") params.trade = tradeFilter;
      if (zipFilter) params.zip = zipFilter;
      setSearchParams(params, { replace: true });

      setLoading(true);
      searchProsPublic({
        q: query || undefined,
        trade: tradeFilter !== "All" ? tradeFilter : undefined,
        zip: zipFilter || undefined,
      })
        .then(setPros)
        .catch(() => setPros([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, tradeFilter, zipFilter, setSearchParams]);

  return (
    <Box style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={2} style={{ fontWeight: 800 }}>Find a Pro</Title>
          <Text c="dimmed">Verified professionals in your area, backed by real reviews.</Text>
        </Stack>

        {/* Filters */}
        <Group align="flex-end" gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search by name, trade, or skill…"
            leftSection={<IconSearch size={16} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            style={{ flex: "1 1 280px", minWidth: 220 }}
          />
          <TextInput
            placeholder="ZIP code"
            leftSection={<IconMapPin size={16} />}
            value={zipFilter}
            onChange={(e) => setZipFilter(e.currentTarget.value)}
            style={{ width: 140 }}
            maxLength={10}
          />
        </Group>

        <Chip.Group value={tradeFilter} onChange={(v) => setTradeFilter(v as string)}>
          <Group gap="xs" wrap="wrap">
            {TRADES.map((t) => <Chip key={t} value={t} size="sm">{t}</Chip>)}
          </Group>
        </Chip.Group>

        {/* Results */}
        {loading ? (
          <Group justify="center" py="xl"><Loader size="md" /></Group>
        ) : pros.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            No pros found. Try a different search, trade, or ZIP.
          </Text>
        ) : (
          <>
            <Text size="xs" c="dimmed">{pros.length} pro{pros.length !== 1 ? "s" : ""} found</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {pros.map((pro) => (
                <Card
                  key={pro.id}
                  withBorder
                  radius="md"
                  padding="md"
                  style={{ cursor: pro.handle ? "pointer" : "default" }}
                  onClick={() => pro.handle && navigate(`/pros/${pro.handle}`)}
                >
                  <Stack gap="sm">
                    {pro.avatar_url && (
                      <Box
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "var(--mantine-color-gray-2)",
                        }}
                      >
                        <img src={pro.avatar_url} alt={pro.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    )}
                    <Stack gap={2}>
                      <Group gap="xs" wrap="nowrap">
                        <Text fw={700} lineClamp={1}>{pro.name}</Text>
                        {pro.is_verified && <Badge size="xs" color="green">Verified</Badge>}
                      </Group>
                      <Text size="sm" c="dimmed">{pro.primary_trade || "General"}</Text>
                      {pro.bio && (
                        <Text size="xs" c="dimmed" lineClamp={2}>{pro.bio}</Text>
                      )}
                    </Stack>
                    <Group gap="xs" wrap="wrap">
                      {pro.base_zip && (
                        <Badge size="xs" variant="light" color="gray" leftSection={<IconMapPin size={10} />}>
                          {pro.base_zip}
                        </Badge>
                      )}
                      {pro.stats.recs_approved > 0 && (
                        <Badge size="xs" variant="light">{pro.stats.recs_approved} reviews</Badge>
                      )}
                      {pro.stats.avg_stars != null && (
                        <Badge size="xs" variant="light" color="yellow">
                          {pro.stats.avg_stars.toFixed(1)} ★
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Box>
  );
}
