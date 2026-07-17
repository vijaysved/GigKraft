import { Avatar, Badge, Box, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconHeart, IconHeartFilled, IconHelmet, IconMail, IconPhone } from "@tabler/icons-react";
import type { ReactNode, Ref } from "react";

import { fallbackAvatar } from "../assets/fallbackAvatars";
import { SpeedometerGauge } from "./SpeedometerGauge";
import { formatPhone, maskEmail, maskPhone } from "../utils/format";

export interface ProviderCardFavorite {
  isFavorited: boolean;
  onToggle: () => void;
  isAuthenticated: boolean;
}

interface ProviderCardProps {
  cardRef?: Ref<HTMLDivElement>;
  onClick?: () => void;
  highlighted?: boolean;
  avatarUrl?: string | null;
  avatarSeed: number | string;
  name: string;
  tier: "pro" | "referred";
  isPending?: boolean;
  trade?: string | null;
  /** Puts trade on the name line (line 1) instead of its own line below. */
  inlineTrade?: boolean;
  phone?: string | null;
  email?: string | null;
  respondsIn?: string | null;
  topRightAction?: ReactNode;
  favorite?: ProviderCardFavorite;
  /** Blurs the avatar (contact info stays hidden) to anonymous visitors. Real uploaded
   * photos are blurred heavily; generic stock avatars get a much lighter blur since
   * they don't identify anyone. The name stays visible; phone/email are partially masked. */
  blurred?: boolean;
  /** design-specs/11.ContactCardUpdate.md — 0-100, or null/undefined = "not enough data". */
  popularityScore?: number | null;
  qualityScore?: number | null;
  children?: ReactNode;
}

/** Shared visual shell for every service-provider card (Search, Referrer, Community pages):
 * bordered brand frame, watermark, avatar + tier badge, favorite toggle, "powered by" footer. */
export function ProviderCard({
  cardRef,
  onClick,
  highlighted,
  avatarUrl,
  avatarSeed,
  name,
  tier,
  isPending,
  trade,
  inlineTrade,
  phone,
  email,
  respondsIn,
  topRightAction,
  favorite,
  blurred,
  popularityScore,
  qualityScore,
  children,
}: ProviderCardProps) {
  const hasRealAvatar = !!avatarUrl;
  const firstName = name.split(" ")[0];
  const avatarBlur = blurred ? (hasRealAvatar ? "blur(8px)" : "blur(2px)") : undefined;

  const badges = (
    <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
      {tier === "pro" ? (
        <Tooltip label="GigKraft Pro" position="top" withArrow>
          <Box
            style={{
              flexShrink: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--gk-accent-primary)",
            }}
          >
            <IconHelmet size={12} color="var(--gk-accent-secondary)" />
          </Box>
        </Tooltip>
      ) : (
        <Badge
          size="xs"
          variant="filled"
          style={{
            flexShrink: 0,
            backgroundColor: "var(--gk-accent-secondary)",
            color: "var(--gk-accent-primary)",
          }}
        >
          Pro
        </Badge>
      )}
      {isPending && (
        <Badge
          size="xs"
          variant="filled"
          style={{ flexShrink: 0, backgroundColor: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" }}
        >
          Pending
        </Badge>
      )}
    </Group>
  );

  return (
    <Card
      ref={cardRef}
      withBorder
      radius="md"
      p="sm"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : undefined,
        borderColor: tier === "pro" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)",
        boxShadow: highlighted
          ? "0 0 0 2px var(--gk-accent-primary), 0 4px 16px color-mix(in srgb, var(--gk-accent-primary) 30%, transparent)"
          : "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
        position: "relative",
        overflow: "hidden",
      }}
    >
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

      {favorite && (
        <Tooltip
          label={favorite.isAuthenticated ? (favorite.isFavorited ? "Remove from favorites" : "Save to favorites") : "Sign in to save favorites"}
          position="top"
          withArrow
        >
          <Box
            onClick={(e) => { e.stopPropagation(); favorite.onToggle(); }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "1.5px solid var(--gk-border)",
              background: "var(--gk-bg-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            {favorite.isFavorited
              ? <IconHeartFilled size={13} color="var(--gk-accent-primary)" />
              : <IconHeart size={13} color="var(--gk-text-muted)" />}
          </Box>
        </Tooltip>
      )}

      <Group gap={16} align="flex-start" wrap="nowrap" mb={5} style={{ position: "relative", zIndex: 1 }}>
        <Avatar
          src={avatarUrl || fallbackAvatar(avatarSeed)}
          radius={hasRealAvatar ? "sm" : "50%"}
          size={80}
          style={{
            flexShrink: 0,
            border: "2px solid var(--gk-accent-primary)",
            filter: avatarBlur,
          }}
        >
          {name[0]?.toUpperCase()}
        </Avatar>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: name + tier badge (+ action, for the default layout) */}
          <Group gap={4} justify="space-between" wrap="nowrap">
            <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text fw={700} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {firstName}
              </Text>
              {!inlineTrade && badges}
            </Group>
            {inlineTrade ? badges : topRightAction}
          </Group>

          {/* Row 2: trade / title, under the name */}
          {trade && <Text size="xs" c="dimmed">{trade}</Text>}

          {phone && (
            <Group gap={4} wrap="nowrap">
              <IconPhone size={11} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
              <Text size="xs">{blurred ? maskPhone(phone) : formatPhone(phone)}</Text>
            </Group>
          )}

          {email && (
            <Group gap={4} wrap="nowrap">
              <IconMail size={11} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
              <Text size="xs" truncate>{blurred ? maskEmail(email) : email}</Text>
            </Group>
          )}

          {/* Row 4: action (community layout only — moved below contact rows) */}
          {inlineTrade && topRightAction}

          {respondsIn && <Text size="xs" c="teal">Responds in {respondsIn}</Text>}
        </Stack>
      </Group>

      {children}

      {(popularityScore !== undefined || qualityScore !== undefined) && (
        <Group
          justify="center"
          gap={20}
          mt={6}
          style={{ position: "relative", zIndex: 1 }}
        >
          <SpeedometerGauge value={popularityScore ?? null} label="Popularity" size={30} />
          <SpeedometerGauge value={qualityScore ?? null} label="Quality" size={30} />
        </Group>
      )}

      <Text
        ta="center"
        style={{
          fontSize: 9,
          color: "var(--gk-accent-primary)",
          opacity: 0.75,
          letterSpacing: 0.5,
          position: "relative",
          zIndex: 1,
          marginTop: 6,
        }}
      >
        powered by gigKraft.com
      </Text>
    </Card>
  );
}
