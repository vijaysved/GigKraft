import {
  Alert,
  Avatar,
  Group,
  Loader,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import type { FollowerOut } from "../types";

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function FollowersTab() {
  const [followers, setFollowers] = useState<FollowerOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;

  async function load(p: number) {
    setLoading(true);
    const r = await fetch(
      `${API_BASE_URL}/api/referrer/me/followers?page=${p}&page_size=${PAGE_SIZE}`,
      { headers: authHeaders() }
    );
    if (r.ok) {
      const data = await r.json() as { total: number; results: FollowerOut[] };
      setFollowers(data.results);
      setTotal(data.total);
    }
    setLoading(false);
  }

  useEffect(() => { load(page); }, [page]);

  return (
    <Stack gap="md">
      <Title order={4}>Followers ({total})</Title>

      {loading ? (
        <Loader size="sm" />
      ) : followers.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No followers yet. Share your referrer page to get started!</Text>
      ) : (
        <>
          {followers.map((f) => (
            <Group
              key={f.id}
              gap="sm"
              p="sm"
              style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}
            >
              <Avatar size={40} radius="xl" color="teal">{f.name[0]?.toUpperCase()}</Avatar>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={600} size="sm">{f.name}</Text>
                <Text size="xs" c="dimmed">{f.phone || f.email}</Text>
                <Text size="xs" c="dimmed">
                  Followed {new Date(f.followed_at).toLocaleDateString()} ·{" "}
                  {f.referrals_received} referral{f.referrals_received !== 1 ? "s" : ""} received
                </Text>
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
