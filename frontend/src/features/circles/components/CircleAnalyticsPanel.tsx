import { Fragment } from "react";
import { Divider, Group, Loader, Paper, Text } from "@mantine/core";
import { IconEye, IconGitBranch, IconSearch, IconSend } from "@tabler/icons-react";

import type { CircleAnalyticsOut } from "../types";

interface Props {
  analytics: CircleAnalyticsOut | null;
  loading?: boolean;
}

export function CircleAnalyticsPanel({ analytics, loading }: Props) {
  const iconColor = "var(--gk-accent-primary)";
  const stats = [
    { label: "Page Views",  value: analytics?.page_views          ?? 0, icon: <IconEye       size={15} color={iconColor} /> },
    { label: "Searches",    value: analytics?.searches             ?? 0, icon: <IconSearch    size={15} color={iconColor} /> },
    { label: "Requests",    value: analytics?.requests_submitted   ?? 0, icon: <IconSend      size={15} color={iconColor} /> },
    { label: "Referrals",   value: analytics?.referrals_attributed ?? 0, icon: <IconGitBranch size={15} color={iconColor} /> },
  ];

  return (
    <Paper
      withBorder
      radius="md"
      px="md"
      py="sm"
      style={{
        borderColor: "var(--gk-accent-primary)",
        boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
      }}
    >
      <Group gap={0} wrap="nowrap">
        {stats.map(({ label, value, icon }, i) => (
          <Fragment key={label}>
            {i > 0 && (
              <Divider
                orientation="vertical"
                mx="md"
                style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.5, alignSelf: "stretch" }}
              />
            )}
            <Group gap={6} wrap="nowrap" align="center" style={{ flex: 1, justifyContent: "center" }}>
              {icon}
              {loading ? (
                <Loader size="xs" />
              ) : (
                <Text fw={700} size="sm" lh={1}>{value}</Text>
              )}
              <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>{label}</Text>
            </Group>
          </Fragment>
        ))}
      </Group>
    </Paper>
  );
}
