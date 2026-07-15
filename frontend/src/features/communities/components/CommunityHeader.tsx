import { Avatar, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconUsersGroup } from "@tabler/icons-react";

import type { CommunityOut } from "../types";

export function CommunityHeader({ community }: { community: CommunityOut }) {
  return (
    <Stack gap="xs" align="center" ta="center">
      <Avatar
        src={community.cover_image_url || undefined}
        size={72}
        radius="xl"
        color="teal"
        style={{ border: "3px solid var(--gk-accent-primary)" }}
      >
        <IconUsersGroup size={32} />
      </Avatar>
      <Group gap="xs" justify="center">
        <Title order={2}>{community.name}</Title>
        {community.status === "archived" && (
          <Badge color="gray" variant="filled">Managed by {community.lead_name} · Archived</Badge>
        )}
      </Group>
      {community.description && (
        <Text size="sm" c="dimmed" maw={480}>{community.description}</Text>
      )}
      {community.status !== "archived" && (
        <Text size="xs" c="dimmed">Maintained by {community.lead_name}</Text>
      )}
      <Group gap="md">
        <Text size="xs" c="dimmed">{community.pro_count} pro{community.pro_count === 1 ? "" : "s"}</Text>
        {community.member_count != null && (
          <Text size="xs" c="dimmed">{community.member_count} member{community.member_count === 1 ? "" : "s"}</Text>
        )}
      </Group>
    </Stack>
  );
}
