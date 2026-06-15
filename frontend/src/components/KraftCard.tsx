import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const GIG_LABELS: Record<string, string> = {
  under_500: "Under $500",
  "500_2000": "$500–$2K",
  "2000_plus": "$2K+",
};

function fmtDate(month: number | null, year: number | null) {
  const parts: string[] = [];
  if (month) parts.push(MONTHS[(month - 1)] ?? "");
  if (year)  parts.push(String(year));
  return parts.join(" ") || null;
}

function GradientLine() {
  return (
    <div style={{
      height: 1,
      background: "var(--gk-brand-gradient)",
      borderRadius: 1,
      opacity: 0.7,
    }} />
  );
}

export interface KraftCardProps {
  title: string;
  skill?: string | null;
  gigType?: string | null;
  description?: string | null;
  location?: string | null;
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  beforeUrl?: string | null;
  afterUrl?: string | null;
}

export function KraftCard({
  title, skill, gigType, description, location,
  startMonth, startYear, endMonth, endYear,
  beforeUrl, afterUrl,
}: KraftCardProps) {
  const fromLabel = fmtDate(startMonth ?? null, startYear ?? null);
  const toLabel   = fmtDate(endMonth   ?? null, endYear   ?? null);
  const dateRange = [fromLabel, toLabel].filter(Boolean).join(" → ");

  const pills = [
    gigType  ? { label: GIG_LABELS[gigType] ?? gigType, color: "green"  } : null,
    skill    ? { label: skill,                           color: "blue"   } : null,
    location ? { label: location,                        color: "violet" } : null,
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <div style={{
      borderRadius: 14,
      padding: 1,
      background: "var(--gk-brand-gradient)",
      boxShadow: "0 8px 40px color-mix(in srgb, var(--gk-accent-primary) 22%, transparent), 0 2px 8px rgba(0,0,0,0.12)",
    }}>
      <div style={{
        borderRadius: 13,
        background: "var(--gk-bg-surface)",
        padding: "20px 24px",
      }}>
        <Stack gap="md">

          {/* Header: title + date left, pills right */}
          <Group align="flex-start" justify="space-between" wrap="nowrap" gap="md">
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Title order={4} style={{ color: "var(--gk-accent-primary)", lineHeight: 1.2 }}>
                {title || <Text span c="dimmed" fw={400} fz="md">Untitled Kraft</Text>}
              </Title>
              {dateRange && <Text size="sm" c="dimmed">{dateRange}</Text>}
            </Stack>
            {pills.length > 0 && (
              <Stack gap={6} align="flex-end" style={{ flexShrink: 0 }}>
                {pills.map((p) => (
                  <Badge key={p.label} variant="light" color={p.color} size="sm" radius="sm">{p.label}</Badge>
                ))}
              </Stack>
            )}
          </Group>

          <GradientLine />

          {/* Photos */}
          {beforeUrl && afterUrl ? (
            <Group grow gap="sm" align="flex-start">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">Before</Text>
                <div style={{ height: 180, borderRadius: 8, overflow: "hidden", background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)" }}>
                  <img src={beforeUrl} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(40%)" }} />
                </div>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" fw={600} tt="uppercase" c="green">After</Text>
                <div style={{ height: 180, borderRadius: 8, overflow: "hidden", background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)" }}>
                  <img src={afterUrl} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </Stack>
            </Group>
          ) : afterUrl ? (
            <div style={{ height: 220, borderRadius: 8, overflow: "hidden", background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)" }}>
              <img src={afterUrl} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ height: 220, borderRadius: 8, background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stack align="center" gap={4}>
                <IconPhoto size={36} color="var(--gk-text-muted)" />
                <Text size="xs" c="dimmed">No photo</Text>
              </Stack>
            </div>
          )}

          {description && (
            <>
              <GradientLine />
              <Text size="sm" style={{ lineHeight: 1.7 }}>{description}</Text>
            </>
          )}

        </Stack>
      </div>
    </div>
  );
}
