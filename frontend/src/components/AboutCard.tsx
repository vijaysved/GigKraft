import { Card, Divider, Group, Stack, Text } from "@mantine/core";

interface AboutCardProps {
  trade?: string | null;
  responseHours?: number | string | null;
  skills?: string[];
  licensed?: boolean;
  licenseNumber?: string | null;
  insured?: boolean;
}

export function AboutCard({ trade, responseHours, skills = [], licensed, licenseNumber, insured }: AboutCardProps) {
  const hasDetails = skills.length > 0 || licensed || insured;
  if (!trade && !responseHours && !hasDetails) return null;

  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)" }}
    >
      <Stack gap="xs">
        {/* Header row: trade left, response right */}
        <Group justify="space-between" align="center" wrap="nowrap">
          {trade && <Text fw={700} size="sm">{trade}</Text>}
          {responseHours && (
            <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>⚡ {responseHours}h response</Text>
          )}
        </Group>

        {hasDetails && (
          <>
            <Divider />
            <Stack gap={2}>
              {skills.map((s) => <Text key={s} size="sm">{s}</Text>)}
              {licensed && (
                <Text size="sm">Licensed{licenseNumber ? ` · ${licenseNumber}` : ""}</Text>
              )}
              {insured && <Text size="sm">Insured</Text>}
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
}
