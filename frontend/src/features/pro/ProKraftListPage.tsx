import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconPencil, IconPlus, IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError, publishKraft, type KraftOut } from "../../api/endpoints";
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
  return <Badge size="xs" variant="light" color={cfg.color}>{cfg.label}</Badge>;
}

async function fetchMyKrafts(): Promise<KraftOut[]> {
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
  const [publishing, setPublishing] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMyKrafts()
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const scoreA = (a.end_year ?? a.start_year ?? 0) * 12 + (a.end_month ?? a.start_month ?? 0);
          const scoreB = (b.end_year ?? b.start_year ?? 0) * 12 + (b.end_month ?? b.start_month ?? 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setKrafts(sorted);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish(kraft: KraftOut) {
    setPublishing((prev) => new Set(prev).add(kraft.id));
    try {
      const updated = await publishKraft(kraft.id);
      setKrafts((prev) => prev.map((k) => (k.id === kraft.id ? updated : k)));
    } catch {
      // silently ignore — user can retry
    } finally {
      setPublishing((prev) => {
        const next = new Set(prev);
        next.delete(kraft.id);
        return next;
      });
    }
  }

  const canPublish = (k: KraftOut) =>
    (k.status === "draft" || k.status === "pending" || k.status === "rejected") && k.has_after;

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Title order={4}>Krafts</Title>
        <Button
          component={Link}
          to="/pro/krafts/new"
          size="xs"
          leftSection={<IconPlus size={14} />}
          style={{ background: "var(--gk-brand-gradient)" }}
        >
          Add Kraft
        </Button>
      </Group>

      {loading && <Center py="xl"><Loader size="sm" /></Center>}
      {error && <Text c="red" size="sm">{error}</Text>}

      {!loading && !error && krafts.length === 0 && (
        <Card withBorder radius="md" padding="lg" style={{ borderColor: "var(--gk-border)" }}>
          <Center>
            <Stack align="center" gap="xs">
              <Text c="dimmed" size="sm">No Krafts yet.</Text>
              <Button
                component={Link}
                to="/pro/krafts/new"
                size="xs"
                leftSection={<IconPlus size={13} />}
                style={{ background: "var(--gk-brand-gradient)" }}
              >
                Create your first Kraft
              </Button>
            </Stack>
          </Center>
        </Card>
      )}

      {!loading && krafts.length > 0 && (
        <Card withBorder radius="md" padding={0} style={{ borderColor: "var(--gk-border)", overflow: "hidden" }}>
          {/* Compact header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "0 12px",
            padding: "6px 12px",
            background: "var(--gk-bg-sidebar)",
            borderBottom: "1px solid var(--gk-border)",
          }}>
            {(["Title", "Date", "Status", ""] as const).map((col) => (
              <Text
                key={col}
                size="xs"
                fw={700}
                tt="uppercase"
                style={{ color: "var(--gk-text-sidebar)", opacity: 0.75, letterSpacing: "0.06em" }}
              >
                {col}
              </Text>
            ))}
          </div>

          {/* Rows */}
          {krafts.map((k, i) => (
            <div
              key={k.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "0 12px",
                padding: "8px 12px",
                alignItems: "center",
                background: i % 2 === 0 ? "var(--gk-bg-surface)" : "color-mix(in srgb, var(--gk-bg-canvas) 60%, var(--gk-bg-surface))",
                borderBottom: i < krafts.length - 1 ? "1px solid var(--gk-border)" : "none",
              }}
            >
              {/* Title + skill */}
              <Stack gap={1}>
                <Text size="sm" fw={600} style={{ color: "var(--gk-accent-primary)", lineHeight: 1.3 }}>
                  {k.title}
                </Text>
                {k.skill && <Text size="xs" c="dimmed">{k.skill}</Text>}
              </Stack>

              {/* Date range */}
              <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                {[fmtDate(k.start_month, k.start_year), fmtDate(k.end_month, k.end_year)]
                  .filter((d) => d !== "—")
                  .join(" → ") || "—"}
              </Text>

              {/* Status + publish shortcut */}
              <Group gap={4} wrap="nowrap">
                <StatusBadge status={k.status} />
                {canPublish(k) && (
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    loading={publishing.has(k.id)}
                    leftSection={<IconSend size={11} />}
                    px={6}
                    style={{ fontSize: 11 }}
                    onClick={() => handlePublish(k)}
                  >
                    Publish
                  </Button>
                )}
              </Group>

              {/* Actions */}
              <Group gap={2} wrap="nowrap" justify="flex-end">
                <Button
                  component={Link}
                  to={`/pro/krafts/${k.slug}`}
                  size="xs"
                  variant="subtle"
                  px={6}
                  title="Edit"
                >
                  <IconPencil size={13} />
                </Button>
                <Button
                  component={Link}
                  to={`/pro/krafts/${k.slug}/preview`}
                  target="_blank"
                  size="xs"
                  variant="subtle"
                  color="gray"
                  px={6}
                  title="Preview"
                >
                  <IconExternalLink size={13} />
                </Button>
              </Group>
            </div>
          ))}
        </Card>
      )}
    </Stack>
  );
}
