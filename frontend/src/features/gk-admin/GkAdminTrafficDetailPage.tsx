import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  CopyButton,
  Group,
  Loader,
  Pagination,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError, getGkTrafficDetail, type GkTrafficDetail, type GkTrafficViewRow } from "../../api/endpoints";
import { GkStatTile } from "../../components/GkStatTile";

const PAGE_SIZE = 50;

type Range = "7d" | "30d" | "all";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function referrerBadge(referrer: string): { label: string; color: string } {
  if (!referrer) return { label: "Direct / Typed", color: "gray" };
  if (referrer.includes("google.")) return { label: "Google", color: "blue" };
  if (referrer.includes("facebook.") || referrer.includes("instagram.")) return { label: "Facebook / Instagram", color: "indigo" };
  if (referrer.includes("gigkraft.com")) return { label: "Internal", color: "dimmed" };
  try {
    const host = new URL(referrer).hostname;
    return { label: host, color: "gray" };
  } catch {
    return { label: "Other", color: "gray" };
  }
}

export function GkAdminTrafficDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<GkTrafficDetail | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [range]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    getGkTrafficDetail(slug, { range, page, page_size: PAGE_SIZE })
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setError(null);
        setNotFound(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to load traffic detail.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, range, page]);

  const totalPages = Math.max(1, Math.ceil((detail?.total ?? 0) / PAGE_SIZE));

  if (notFound) {
    return (
      <Stack>
        <Alert color="red">This tracked page no longer exists.</Alert>
        <ActionIcon variant="subtle" onClick={() => navigate("/gk-admin/dashboard?tab=marketing")} w="fit-content">
          <IconArrowLeft size={18} />
        </ActionIcon>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Back */}
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate("/gk-admin/dashboard?tab=marketing")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text size="sm" c="dimmed">Marketing</Text>
      </Group>

      {error && <Alert color="red">{error}</Alert>}

      {detail && (
        <>
          <Stack gap={2}>
            <Title order={3}>{detail.label}</Title>
            <Group gap={6}>
              <Text size="xs" c="dimmed" ff="monospace" truncate style={{ maxWidth: 480 }}>
                {detail.url}
              </Text>
              <CopyButton value={detail.url}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy URL"}>
                    <ActionIcon size="xs" variant="subtle" color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Stack>

          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <GkStatTile compact label="Last 7 days" value={detail.views_7d} />
            <GkStatTile compact label="Last 30 days" value={detail.views_30d} />
          </SimpleGrid>

          <Group justify="space-between">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }}>
              Individual Visits
            </Text>
            <SegmentedControl
              size="xs"
              value={range}
              onChange={(v) => setRange(v as Range)}
              data={[
                { label: "7 days", value: "7d" },
                { label: "30 days", value: "30d" },
                { label: "All time", value: "all" },
              ]}
            />
          </Group>

          <Card withBorder radius="md" padding="lg">
            <Stack>
              {loading ? (
                <Group justify="center" py="md">
                  <Loader size="sm" />
                </Group>
              ) : detail.rows.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No visits recorded in this range.
                </Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Timestamp</Table.Th>
                      <Table.Th>Referrer</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {detail.rows.map((row: GkTrafficViewRow, i: number) => {
                      const badge = referrerBadge(row.referrer);
                      return (
                        <Table.Tr key={`${row.visited_at}-${i}`}>
                          <Table.Td><Text size="sm">{fmtDateTime(row.visited_at)}</Text></Table.Td>
                          <Table.Td>
                            <Stack gap={2}>
                              <Badge size="xs" color={badge.color} variant="light" w="fit-content">
                                {badge.label}
                              </Badge>
                              {row.referrer && (
                                <Text size="xs" c="dimmed" ff="monospace" truncate style={{ maxWidth: 360 }}>
                                  {row.referrer}
                                </Text>
                              )}
                            </Stack>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}

              {totalPages > 1 && (
                <Group justify="center">
                  <Pagination value={page} onChange={setPage} total={totalPages} size="sm" />
                </Group>
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
