import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";

interface ProResult {
  id: number;
  display_name: string;
  primary_trade: string;
}

interface Props {
  onAdd: (proId: number, endorsement: string) => Promise<void>;
  busy: boolean;
}

export function AddOnPlatformPro({ onAdd, busy }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProResult[]>([]);
  const [selected, setSelected] = useState<ProResult | null>(null);
  const [endorsement, setEndorsement] = useState("");
  const [searching, setSearching] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const token = getAccessToken();
      const r = await fetch(
        `${API_BASE_URL}/api/pros?q=${encodeURIComponent(query)}&limit=10`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = (await r.json()) as { results?: ProResult[] } | ProResult[];
      setResults(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!selected) return;
    await onAdd(selected.id, endorsement);
    setSelected(null);
    setQuery("");
    setEndorsement("");
    setResults([]);
  }

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <TextInput
          placeholder="Search by name or trade…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={{ flex: 1 }}
          size="sm"
        />
        <Button variant="default" size="sm" onClick={search} loading={searching}>
          Search
        </Button>
      </Group>

      <Stack gap={4}>
        {results.map((r) => (
          <Group
            key={r.id}
            justify="space-between"
            p="xs"
            style={{
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: 8,
              background: selected?.id === r.id ? "var(--mantine-color-blue-0)" : undefined,
              cursor: "pointer",
            }}
            onClick={() => setSelected(r)}
          >
            <Stack gap={0}>
              <Text size="sm" fw={500}>{r.display_name}</Text>
              <Text size="xs" c="dimmed">{r.primary_trade}</Text>
            </Stack>
            <Button size="xs" variant={selected?.id === r.id ? "filled" : "light"}>
              {selected?.id === r.id ? "Selected" : "Select"}
            </Button>
          </Group>
        ))}
      </Stack>

      {selected && (
        <Stack gap="xs">
          <Text size="sm">
            Adding: <b>{selected.display_name}</b>
          </Text>
          <TextInput
            placeholder="Add a 1-sentence endorsement (optional, 160 chars max)"
            maxLength={160}
            size="sm"
            value={endorsement}
            onChange={(e) => setEndorsement(e.currentTarget.value)}
          />
          <Button
            loading={busy}
            onClick={handleAdd}
            style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
          >
            Add to Circle
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
