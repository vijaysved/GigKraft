import { Card, Loader, Stack, Text, Title, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

interface GkStatTileProps {
  label: string;
  value?: string | number;
  hint?: string;
  accent?: boolean;
  icon?: ReactNode;
  compact?: boolean;
  tooltip?: string;
}

export function GkStatTile({ label, value, hint, accent, icon, compact, tooltip }: GkStatTileProps) {
  const card = (
    <Card
      withBorder
      radius="md"
      padding={compact ? "xs" : "lg"}
      style={{
        ...(accent ? { borderColor: "var(--gk-accent-primary)" } : {}),
        position: "relative",
        overflow: "hidden",
        cursor: tooltip ? "default" : undefined,
      }}
    >
      <Stack gap={compact ? 2 : 4}>
        <Text size={compact ? "xs" : "sm"} c="dimmed" truncate>{label}</Text>
        {value === undefined ? (
          <Loader size="sm" />
        ) : (
          <Title
            order={compact ? 4 : 2}
            style={{
              fontFamily: "var(--mantine-font-family-monospace)",
              color: accent ? "var(--gk-accent-primary)" : undefined,
            }}
          >
            {value}
          </Title>
        )}
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
        {icon && (
          <div style={{ position: "absolute", top: compact ? 8 : 12, right: compact ? 8 : 12, opacity: 0.15 }}>
            {icon}
          </div>
        )}
      </Stack>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} position="top" withArrow multiline maw={220}>
        {card}
      </Tooltip>
    );
  }
  return card;
}
