import { Avatar, Badge, Box, Divider, Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconStar, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { decodeRecText, getPublicRecommendations, REC_METRICS, type PublicRecOut } from "../api/recommendations";
import { formatMonthYear as fmtMonthYear } from "../utils/format";

function StarRow({ stars }: { stars: number | null }) {
  if (!stars || stars < 1) return null;
  return (
    <Group gap={3}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar
          key={n}
          size={13}
          fill={n <= stars ? "var(--gk-accent-primary)" : "none"}
          color={n <= stars ? "var(--gk-accent-primary)" : "var(--gk-border)"}
        />
      ))}
    </Group>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RecCard({ rec }: { rec: PublicRecOut }) {
  const { metrics, text } = decodeRecText(rec.text);
  const yesKeys = metrics ? REC_METRICS.filter(({ key }) => metrics[key]) : [];
  const noKeys  = metrics ? REC_METRICS.filter(({ key }) => !metrics[key]) : [];

  return (
    <Box
      style={{
        borderRadius: 16,
        background: "var(--gk-bg-surface)",
        border: "1.5px solid var(--gk-border)",
        overflow: "hidden",
        boxShadow: "0 4px 20px color-mix(in srgb, var(--gk-accent-primary) 6%, transparent), 0 1px 4px rgba(0,0,0,0.07)",
      }}
    >
      <Box style={{ height: 3, background: "var(--gk-brand-gradient)" }} />

      <Stack gap={0} p="md">
        {/* Header: avatar + name + date + stars */}
        <Group align="flex-start" gap="sm" mb="sm">
          <Avatar
            size={42}
            radius="xl"
            style={{
              background: "color-mix(in srgb, var(--gk-accent-primary) 18%, transparent)",
              color: "var(--gk-accent-primary)",
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {initials(rec.client_name)}
          </Avatar>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap">
              <Text fw={700} size="sm" style={{ color: "var(--gk-accent-primary)" }} truncate>
                {rec.client_name}
              </Text>
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {fmtMonthYear(rec.submitted_at)}
              </Text>
            </Group>
            <StarRow stars={rec.stars} />
          </Stack>
        </Group>

        {/* Metrics */}
        {metrics && (
          <>
            <Divider mb="sm" style={{ borderColor: "var(--gk-border)" }} />
            <Stack gap={6} mb="sm">
              {yesKeys.length > 0 && (
                <Group gap="xs" wrap="wrap">
                  {yesKeys.map(({ key, label }) => (
                    <Badge
                      key={key}
                      size="sm"
                      variant="light"
                      leftSection={<IconCheck size={11} />}
                      style={{
                        background: "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)",
                        color: "var(--gk-accent-primary)",
                        border: "1px solid color-mix(in srgb, var(--gk-accent-primary) 25%, transparent)",
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                </Group>
              )}
              {noKeys.length > 0 && (
                <Group gap="xs" wrap="wrap">
                  {noKeys.map(({ key, label }) => (
                    <Badge
                      key={key}
                      size="sm"
                      variant="light"
                      leftSection={<IconX size={11} />}
                      style={{
                        background: "var(--gk-bg-canvas)",
                        color: "var(--gk-text-muted, #888)",
                        border: "1px solid var(--gk-border)",
                        opacity: 0.55,
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          </>
        )}

        {/* Review text */}
        {text && (
          <>
            {metrics && <Divider mb="sm" style={{ borderColor: "var(--gk-border)" }} />}
            <Text
              size="sm"
              fs="italic"
              style={{
                lineHeight: 1.7,
                color: "var(--gk-text-muted, #888)",
                borderLeft: "3px solid var(--gk-accent-primary)",
                paddingLeft: 12,
              }}
            >
              "{text}"
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
}

interface Props {
  handle: string | null | undefined;
}

export function ReviewsSection({ handle }: Props) {
  const [recs, setRecs] = useState<PublicRecOut[]>([]);

  useEffect(() => {
    if (!handle) return;
    getPublicRecommendations(handle).then(setRecs).catch(() => {});
  }, [handle]);

  if (recs.length === 0) return null;

  // Compute per-metric endorsement counts across all recs
  const metricCounts = REC_METRICS.map(({ key, label }) => {
    const count = recs.filter((r) => {
      const { metrics } = decodeRecText(r.text);
      return metrics?.[key] === true;
    }).length;
    return { key, label, count };
  }).filter(({ count }) => count > 0).sort((a, b) => b.count - a.count);

  return (
    <Stack gap="lg">
      {/* Summary header */}
      <Group align="center" gap="md">
        {/* Total circle */}
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--gk-brand-gradient)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px color-mix(in srgb, var(--gk-accent-primary) 30%, transparent)",
            flexShrink: 0,
          }}
        >
          <Text fw={800} size="xl" c="white" style={{ lineHeight: 1 }}>{recs.length}</Text>
          <Text size="xs" c="white" opacity={0.85} style={{ lineHeight: 1, marginTop: 2 }}>recs</Text>
        </Box>

        <Stack gap={6}>
          <Text fw={800} size="lg" style={{ color: "var(--gk-accent-primary)", letterSpacing: "-0.02em" }}>
            Recommendations
          </Text>
          {/* Per-metric counts */}
          {metricCounts.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {metricCounts.map(({ key, label, count }) => (
                <Badge
                  key={key}
                  size="sm"
                  variant="light"
                  style={{
                    background: "color-mix(in srgb, var(--gk-accent-primary) 10%, transparent)",
                    color: "var(--gk-accent-primary)",
                    border: "1px solid color-mix(in srgb, var(--gk-accent-primary) 20%, transparent)",
                  }}
                >
                  {label} · {count}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Group>

      {/* Individual cards */}
      <Stack gap="md">
        {recs.map((r) => (
          <RecCard key={r.id} rec={r} />
        ))}
      </Stack>
    </Stack>
  );
}
