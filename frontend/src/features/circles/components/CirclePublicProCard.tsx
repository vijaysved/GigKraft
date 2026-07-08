import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBolt,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";

import type { CircleProOut } from "../types";
import { RequestIntroModal } from "./RequestIntroModal";
import { RequestProModal } from "./RequestProModal";
import { formatPhone } from "../../../utils/format";

interface Props {
  cp: CircleProOut;
  slug: string;
  curatorName: string;
}

export function CirclePublicProCard({ cp, slug, curatorName }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const isPending = cp.status === "pending";
  const profileUrl = cp.handle ? `/pros/${cp.handle}` : null;

  const cardStyle = {
    borderColor: "var(--gk-accent-primary)",
    boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
    position: "relative" as const,
    overflow: "hidden" as const,
  };
  const dividerStyle = { borderColor: "var(--gk-accent-secondary)", opacity: 0.6 };

  return (
    <>
      <Card withBorder radius="md" p="sm" style={cardStyle}>
        {/* Watermark */}
        <Text
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-22deg)",
            fontSize: 22,
            fontWeight: 900,
            color: "var(--gk-accent-primary)",
            opacity: 0.06,
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: 3,
            zIndex: 0,
          }}
        >
          gigKraft.com
        </Text>

        {/* Photo + info */}
        <Group gap="sm" align="flex-start" wrap="nowrap" mb={5} style={{ position: "relative", zIndex: 1 }}>
          <Avatar
            src={cp.avatar_url}
            radius="sm"
            size={80}
            color="teal"
            style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)" }}
          >
            {cp.display_name[0]?.toUpperCase()}
          </Avatar>

          <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={4} justify="space-between" wrap="nowrap">
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Group gap={4} wrap="nowrap">
                  <Text fw={700} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cp.display_name}
                  </Text>
                  {cp.is_off_platform && (
                    <Badge
                      color={cp.status === "claimed" ? "green" : "gray"}
                      variant="outline"
                      size="xs"
                      style={{ flexShrink: 0 }}
                    >
                      {cp.status === "claimed" ? "On Gigkraft" : "Pending"}
                    </Badge>
                  )}
                </Group>
                {cp.primary_trade && <Text size="xs" c="dimmed">{cp.primary_trade}</Text>}
                {profileUrl && (
                  <Anchor
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    c="dimmed"
                    style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                  >
                    @{cp.handle}<IconExternalLink size={10} />
                  </Anchor>
                )}
              </Stack>
              <Button
                size="compact-xs"
                variant="light"
                radius="xl"
                onClick={() => setModalOpen(true)}
                style={{ flexShrink: 0, alignSelf: "flex-start", fontSize: 11 }}
              >
                {isPending ? "Intro" : "Request"}
              </Button>
            </Group>

            {/* Contact row — only show for on-platform pros */}
            {!cp.is_off_platform && (
              <Stack gap={1} mt={2}>
                <Group gap={4}>
                  <IconPhone size={11} color="var(--gk-accent-primary)" />
                  <Text size="xs" c={cp.phone ? undefined : "dimmed"}>{cp.phone ? formatPhone(cp.phone) : "—"}</Text>
                </Group>
                <Group gap={4}>
                  <IconMail size={11} color="var(--gk-accent-primary)" />
                  <Text size="xs" c={cp.email ? undefined : "dimmed"}>{cp.email ?? "—"}</Text>
                </Group>
                <Group gap={4}>
                  <IconMapPin size={11} color="var(--gk-accent-primary)" />
                  <Text size="xs" c={cp.zip_code ? undefined : "dimmed"}>{cp.zip_code ?? "—"}</Text>
                </Group>
              </Stack>
            )}
          </Stack>
        </Group>

        {/* Bio */}
        {cp.bio && (
          <Text size="xs" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
            {cp.bio}
          </Text>
        )}

        {/* Skill tags */}
        {cp.skill_tags.length > 0 && (
          <Group gap={4} mb={4} style={{ position: "relative", zIndex: 1 }}>
            {cp.skill_tags.slice(0, 4).map((s) => (
              <Badge key={s} size="xs" variant="outline" color="gray">{s}</Badge>
            ))}
          </Group>
        )}

        <Divider my={4} style={dividerStyle} />

        {/* Endorsement */}
        {cp.endorsement && (
          <Text size="xs" fs="italic" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
            "{cp.endorsement}" — {curatorName}
          </Text>
        )}

        <Divider my={4} style={dividerStyle} />

        {/* Stats */}
        <Group gap={0} justify="space-around" pt={2} style={{ position: "relative", zIndex: 1 }}>
          <Stack gap={1} align="center">
            <IconBolt size={20} color="var(--gk-accent-primary)" />
            <Text size="xs" fw={700} lh={1}>{cp.krafts_verified}</Text>
            <Text size="xs" c="dimmed">Krafts</Text>
          </Stack>
          <Divider orientation="vertical" style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.5, alignSelf: "stretch" }} />
          <Stack gap={1} align="center">
            <IconStar size={20} color="var(--mantine-color-yellow-5)" />
            <Text size="xs" fw={700} lh={1}>{cp.recs_approved}</Text>
            <Text size="xs" c="dimmed">Recs</Text>
          </Stack>
          <Divider orientation="vertical" style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.5, alignSelf: "stretch" }} />
          <Stack gap={1} align="center">
            <IconUsers size={20} color="var(--mantine-color-blue-5)" />
            <Text size="xs" fw={700} lh={1}>{cp.circles_count}</Text>
            <Text size="xs" c="dimmed">Circles</Text>
          </Stack>
        </Group>

        <Text
          ta="center"
          style={{
            fontSize: 9,
            color: "var(--gk-accent-primary)",
            opacity: 0.5,
            letterSpacing: 0.5,
            position: "relative",
            zIndex: 1,
            marginTop: 6,
          }}
        >
          powered by gigKraft.com
        </Text>
      </Card>

      {isPending ? (
        <RequestIntroModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          circleProId={cp.id}
          proName={cp.display_name}
          slug={slug}
        />
      ) : (
        <RequestProModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          proId={cp.pro_id}
          circleProId={cp.id}
          proName={cp.display_name}
          slug={slug}
        />
      )}
    </>
  );
}
