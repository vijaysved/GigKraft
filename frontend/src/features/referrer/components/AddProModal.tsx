import {
  Alert,
  Avatar,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { addReferrerPro, ApiError } from "../../../api/endpoints";

interface ProSearchResult {
  user_id: number;
  handle: string;
  name: string;
  trade: string;
  city: string;
  avatar_url: string;
  is_verified: boolean;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddProModal({ opened, onClose, onAdded }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<ProSearchResult | null>(null);
  const [endorsement, setEndorsement] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await fetch(`${API_BASE_URL}/api/referrer/pros/search?q=${encodeURIComponent(query)}`);
      if (r.ok) setResults(await r.json() as ProSearchResult[]);
      setSearching(false);
    }, 300);
  }, [query]);

  async function addPro() {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      const result = await addReferrerPro(selected.handle, endorsement || undefined);
      if (!result.ok) throw new ApiError(result.status, result.detail ?? "Failed to add pro.");
      onAdded();
      onClose();
      setSelected(null);
      setQuery("");
      setEndorsement("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add a pro" centered>
      <Stack gap="sm">
        {!selected ? (
          <>
            <TextInput
              label="Search pros"
              placeholder="Name, trade, or handle…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rightSection={searching ? <Loader size={14} /> : null}
            />
            {results.map((pro) => (
              <Group
                key={pro.user_id}
                gap="sm"
                p="xs"
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 8,
                }}
                onClick={() => setSelected(pro)}
              >
                <Avatar src={pro.avatar_url || undefined} size={40} radius="sm" color="teal">
                  {pro.name[0]?.toUpperCase()}
                </Avatar>
                <Stack gap={0}>
                  <Text size="sm" fw={600}>{pro.name}</Text>
                  <Text size="xs" c="dimmed">{pro.trade} · {pro.city}</Text>
                </Stack>
              </Group>
            ))}
          </>
        ) : (
          <>
            <Group gap="sm">
              <Avatar src={selected.avatar_url || undefined} size={48} radius="sm" color="teal">
                {selected.name[0]?.toUpperCase()}
              </Avatar>
              <Stack gap={0}>
                <Text fw={600}>{selected.name}</Text>
                <Text size="xs" c="dimmed">{selected.trade}</Text>
              </Stack>
              <Button size="xs" variant="subtle" ml="auto" onClick={() => setSelected(null)}>Change</Button>
            </Group>
            <Textarea
              label="Why do you recommend them? (shown on your page)"
              placeholder="Joe fixed our roof in a day after the storm — he's the real deal."
              value={endorsement}
              onChange={(e) => setEndorsement(e.target.value)}
              minRows={2}
            />
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Button fullWidth radius="xl" loading={adding} onClick={addPro}>
              Add to my page
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
