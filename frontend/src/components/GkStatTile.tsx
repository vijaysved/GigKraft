import { Card, Loader, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface GkStatTileProps {
  label: string;
  value?: string | number;
  hint?: string;
  accent?: boolean;
  icon?: ReactNode;
}

export function GkStatTile({ label, value, hint, accent, icon }: GkStatTileProps) {
  return (
    <Card withBorder radius="md" padding="lg" style={accent ? { borderColor: "var(--gk-accent-primary)" } : {}}>
      <Stack gap={4}>
        <Text size="sm" c="dimmed">{label}</Text>
        {value === undefined ? (
          <Loader size="sm" />
        ) : (
          <Title order={2} style={{ fontFamily: "var(--mantine-font-family-monospace)", color: accent ? "var(--gk-accent-primary)" : undefined }}>
            {value}
          </Title>
        )}
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
        {icon && <div style={{ position: "absolute", top: 12, right: 12, opacity: 0.15 }}>{icon}</div>}
      </Stack>
    </Card>
  );
}
