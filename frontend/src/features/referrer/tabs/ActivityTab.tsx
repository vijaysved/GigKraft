import {
  Group,
  Loader,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { getReferrerActivity } from "../../../api/endpoints";
import type { ReferralSentSummaryOut } from "../types";
import { formatDate } from "../../../utils/format";

export function ActivityTab() {
  const [items, setItems] = useState<ReferralSentSummaryOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;

  async function load(p: number) {
    setLoading(true);
    try {
      const data = await getReferrerActivity(p, PAGE_SIZE);
      setItems(data.results);
      setTotal(data.total);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  return (
    <Stack gap="md">
      <Title order={4}>Activity — Referrals Sent ({total})</Title>

      {loading ? (
        <Loader size="sm" />
      ) : items.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No referrals sent yet.</Text>
      ) : (
        <>
          {items.map((s) => (
            <Group
              key={s.id}
              gap="sm"
              p="sm"
              style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}
            >
              <IconSend size={20} color="var(--mantine-color-teal-6)" />
              <Stack gap={1} style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {s.follower_name} → {s.pro_name || "general"}
                </Text>
                <Text size="xs" c="dimmed">{formatDate(s.sent_at)}</Text>
              </Stack>
            </Group>
          ))}

          {total > PAGE_SIZE && (
            <Pagination
              total={Math.ceil(total / PAGE_SIZE)}
              value={page}
              onChange={setPage}
              size="sm"
            />
          )}
        </>
      )}
    </Stack>
  );
}
