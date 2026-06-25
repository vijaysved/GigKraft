import { Avatar, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconShieldCheck, IconStar, IconUsers } from "@tabler/icons-react";
import { useState } from "react";

import type { CircleProCardData } from "../types";
import { RequestIntroModal } from "./RequestIntroModal";
import { RequestProModal } from "./RequestProModal";

const TIER_STYLES = {
  1: {
    border: "2px solid #F59E0B",
    label: "Vouched",
    icon: <IconStar size={12} />,
    color: "yellow" as const,
  },
  2: {
    border: "2px solid #3B82F6",
    label: "Used by Friends",
    icon: <IconUsers size={12} />,
    color: "blue" as const,
  },
  3: {
    border: "1px solid var(--mantine-color-gray-3)",
    label: "Gigkraft Verified",
    icon: <IconShieldCheck size={12} />,
    color: "green" as const,
  },
};

interface Props {
  data: CircleProCardData;
  tier: 1 | 2 | 3;
  slug: string;
  showTierBadge?: boolean;
}

export function CircleProCard({ data, tier, slug, showTierBadge = true }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const style = TIER_STYLES[tier];
  const isPending = data.status === "pending";

  return (
    <>
      <Card withBorder radius="md" padding="md" style={{ borderLeft: style.border }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Avatar src={data.avatar_url} radius="xl" size="md" color="teal">
              {data.display_name[0]?.toUpperCase()}
            </Avatar>
            <Stack gap={2}>
              <Group gap="xs" wrap="nowrap">
                <Text fw={600} size="sm">{data.display_name}</Text>
                {showTierBadge && (
                  <Badge color={style.color} variant="light" size="xs" leftSection={style.icon}>
                    {style.label}
                  </Badge>
                )}
                {isPending && (
                  <Badge color="gray" variant="outline" size="xs">
                    Invited / Pending
                  </Badge>
                )}
              </Group>
              {data.primary_trade && (
                <Text size="xs" c="dimmed">{data.primary_trade}</Text>
              )}
              {data.endorsement && (
                <Text size="xs" c="dimmed" fs="italic">"{data.endorsement}"</Text>
              )}
            </Stack>
          </Group>
          <Button
            size="xs"
            variant={tier === 1 ? "filled" : "light"}
            onClick={() => setModalOpen(true)}
            style={tier === 1 ? { background: "var(--gk-brand-gradient, #4F46E5)" } : undefined}
            ml="sm"
          >
            {isPending ? "Request Intro" : "Request Pro"}
          </Button>
        </Group>
      </Card>

      {isPending ? (
        <RequestIntroModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          circleProId={data.id}
          proName={data.display_name}
          slug={slug}
        />
      ) : (
        <RequestProModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          proId={data.pro_id}
          circleProId={data.id}
          proName={data.display_name}
          slug={slug}
        />
      )}
    </>
  );
}
