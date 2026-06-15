import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface GkEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function GkEmptyState({ icon, title, description, action }: GkEmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" py={48} px="md">
      {icon && <div style={{ fontSize: 48, opacity: 0.3 }}>{icon}</div>}
      <Title order={4} ta="center" c="dimmed">{title}</Title>
      {description && <Text size="sm" c="dimmed" ta="center" maw={360}>{description}</Text>}
      {action}
    </Stack>
  );
}
