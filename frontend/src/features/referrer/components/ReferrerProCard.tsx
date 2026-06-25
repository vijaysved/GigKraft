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
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useState } from "react";

import type { ProCardOut } from "../types";
import { RequestReferralModal } from "./RequestReferralModal";

interface Props {
  pro: ProCardOut;
  slug: string;
  referrerName: string;
  allPros: ProCardOut[];
  isFollower: boolean;
  onNeedFollow: () => void;
}

export function ReferrerProCard({ pro, slug, referrerName, allPros, isFollower, onNeedFollow }: Props) {
  const [requestOpen, setRequestOpen] = useState(false);

  const cardStyle = {
    borderColor: "var(--gk-accent-primary)",
    boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  function handleRequestClick() {
    if (!isFollower) {
      onNeedFollow();
      return;
    }
    setRequestOpen(true);
  }

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

        <Group gap="sm" align="flex-start" wrap="nowrap" mb={5} style={{ position: "relative", zIndex: 1 }}>
          <Avatar
            src={pro.avatar_url || undefined}
            radius="sm"
            size={80}
            color="teal"
            style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)" }}
          >
            {pro.name[0]?.toUpperCase()}
          </Avatar>

          <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={4} justify="space-between" wrap="nowrap">
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Group gap={4} wrap="nowrap">
                  <Text fw={700} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pro.name}
                  </Text>
                  {pro.is_pending && (
                    <Badge color="gray" variant="outline" size="xs" style={{ flexShrink: 0 }}>Pending</Badge>
                  )}
                </Group>
                {pro.trade && <Text size="xs" c="dimmed">{pro.trade}</Text>}
                {pro.responds_in && (
                  <Text size="xs" c="teal">Responds in {pro.responds_in}</Text>
                )}
              </Stack>
              <Button
                size="compact-xs"
                variant="light"
                radius="xl"
                onClick={handleRequestClick}
                style={{ flexShrink: 0, alignSelf: "flex-start", fontSize: 11 }}
              >
                Refer me
              </Button>
            </Group>

            {/* Contact — plain text always visible, tap-to-call only after referral sent */}
            <Stack gap={1} mt={2}>
              <Group gap={4}>
                <IconPhone size={11} color="var(--gk-accent-primary)" />
                {pro.tap_to_call && pro.phone ? (
                  <Anchor href={`tel:${pro.phone}`} size="xs">{pro.phone}</Anchor>
                ) : (
                  <Text size="xs" c={pro.phone ? undefined : "dimmed"}>{pro.phone || "—"}</Text>
                )}
              </Group>
              <Group gap={4}>
                <IconMail size={11} color="var(--gk-accent-primary)" />
                <Text size="xs" c={pro.email ? undefined : "dimmed"}>{pro.email || "—"}</Text>
              </Group>
              {pro.city && (
                <Group gap={4}>
                  <IconMapPin size={11} color="var(--gk-accent-primary)" />
                  <Text size="xs">{pro.city}</Text>
                </Group>
              )}
            </Stack>
          </Stack>
        </Group>

        {pro.endorsement && (
          <Text size="xs" fs="italic" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
            "{pro.endorsement}" — {referrerName}
          </Text>
        )}

        {(pro.is_licensed || pro.is_insured) && (
          <Group gap={4} mb={4} style={{ position: "relative", zIndex: 1 }}>
            {pro.is_licensed && (
              <Badge size="xs" variant="outline" color="teal" leftSection={<IconShieldCheck size={10} />}>Licensed</Badge>
            )}
            {pro.is_insured && (
              <Badge size="xs" variant="outline" color="blue" leftSection={<IconShieldCheck size={10} />}>Insured</Badge>
            )}
          </Group>
        )}

        {pro.request_status && (
          <>
            <Divider my={4} style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.6 }} />
            <Badge
              size="xs"
              color={pro.request_status === "sent" ? "teal" : "yellow"}
              variant="light"
            >
              {pro.request_status === "sent" ? "Referral sent ✓" : "Request pending"}
            </Badge>
          </>
        )}

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

      <RequestReferralModal
        opened={requestOpen}
        onClose={() => setRequestOpen(false)}
        slug={slug}
        referrerName={referrerName}
        selectedPro={pro}
        pros={allPros}
        onRequested={() => setRequestOpen(false)}
      />
    </>
  );
}
