import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconPencil, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError, type KraftOut } from "../../api/endpoints";
import { client } from "../../api/client";

const MONTHS_SHORT = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(month: number | null | undefined, year: number | null | undefined): string {
  if (!month && !year) return "—";
  const m = month ? (MONTHS_SHORT[month] ?? "") : "";
  return [m, year].filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    draft:    { color: "gray",   label: "Draft" },
    pending:  { color: "yellow", label: "Pending" },
    verified: { color: "green",  label: "Published" },
    rejected: { color: "red",    label: "Rejected" },
  };
  const cfg = map[status] ?? { color: "gray", label: status };
  return <Badge size="sm" variant="light" color={cfg.color}>{cfg.label}</Badge>;
}

async function fetchMyKrafts(): Promise<KraftOut[]> {
  // Pass mine as a string "true" — openapi-fetch serialises booleans
  // but Django Ninja also accepts the raw string "true".
  const { data, error, response } = await client.GET("/api/krafts", {
    params: { query: { mine: true } },
  });
  if (!data) {
    const detail =
      typeof error === "object" && error !== null && "detail" in error
        ? String((error as { detail: unknown }).detail)
        : "Failed to load Krafts.";
    throw new ApiError(response.status, detail);
  }
  return data as KraftOut[];
}

export function ProKraftListPage() {
  const [krafts, setKrafts] = useState<KraftOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyKrafts()
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const scoreA =
            (a.end_year ?? a.start_year ?? 0) * 12 +
            (a.end_month ?? a.start_month ?? 0);
          const scoreB =
            (b.end_year ?? b.start_year ?? 0) * 12 +
            (b.end_month ?? b.start_month ?? 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        });
        setKrafts(sorted);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack gap="md">
      {/* Header row */}
      <Group justify="space-between" align="center">
        <Title order={3}>Krafts</Title>
        <Button
          component={Link}
          to="/pro/krafts/new"
          leftSection={<IconPlus size={16} />}
          style={{ background: "var(--gk-brand-gradient)" }}
        >
          Add Kraft
        </Button>
      </Group>

      {loading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      {!loading && !error && krafts.length === 0 && (
        <Card
          withBorder
          radius="md"
          padding="xl"
          style={{
            borderColor: "var(--gk-border)",
            background: "var(--gk-bg-surface)",
          }}
        >
          <Center>
            <Stack align="center" gap="sm">
              <Text c="dimmed" size="sm">
                No Krafts yet.
              </Text>
              <Button
                component={Link}
                to="/pro/krafts/new"
                size="xs"
                leftSection={<IconPlus size={14} />}
                style={{ background: "var(--gk-brand-gradient)" }}
              >
                Create your first Kraft
              </Button>
            </Stack>
          </Center>
        </Card>
      )}

      {!loading && krafts.length > 0 && (
        <Card
          withBorder
          radius="md"
          padding={0}
          style={{ borderColor: "var(--gk-border)", overflow: "hidden" }}
        >
          <Table
            highlightOnHover
            verticalSpacing="sm"
            horizontalSpacing="md"
          >
            {/* ── Header: sidebar background so text always contrasts ── */}
            <Table.Thead>
              <Table.Tr
                style={{
                  background: "var(--gk-bg-sidebar)",
                  borderBottom: "2px solid var(--gk-border)",
                }}
              >
                {(["Title", "Start", "End", "Status", ""] as const).map(
                  (col) => (
                    <Table.Th
                      key={col}
                      style={{
                        color: "var(--gk-text-sidebar)",
                        fontWeight: 700,
                        fontSize: "var(--mantine-font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                        width: col === "" ? 100 : undefined,
                      }}
                    >
                      {col}
                    </Table.Th>
                  )
                )}
              </Table.Tr>
            </Table.Thead>

            {/* ── Body ── */}
            <Table.Tbody
              style={{ background: "var(--gk-bg-surface)" }}
            >
              {krafts.map((k) => (
                <Table.Tr
                  key={k.id}
                  style={{ borderBottom: "1px solid var(--gk-border)" }}
                >
                  {/* Title + skill */}
                  <Table.Td>
                    <Stack gap={2}>
                      <Text
                        size="sm"
                        fw={600}
                        style={{ color: "var(--gk-accent-primary)" }}
                      >
                        {k.title}
                      </Text>
                      {k.skill && (
                        <Text size="xs" c="dimmed">
                          {k.skill}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>

                  {/* Start date */}
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {fmtDate(k.start_month, k.start_year)}
                    </Text>
                  </Table.Td>

                  {/* End date */}
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {fmtDate(k.end_month, k.end_year)}
                    </Text>
                  </Table.Td>

                  {/* Status */}
                  <Table.Td>
                    <StatusBadge status={k.status} />
                  </Table.Td>

                  {/* Actions */}
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Button
                        component={Link}
                        to={`/pro/krafts/${k.slug}`}
                        size="xs"
                        variant="subtle"
                        leftSection={<IconPencil size={13} />}
                      >
                        Edit
                      </Button>
                      <Button
                        component={Link}
                        to={`/pro/krafts/${k.slug}/preview`}
                        target="_blank"
                        size="xs"
                        variant="subtle"
                        color="gray"
                        px={6}
                      >
                        <IconExternalLink size={13} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
