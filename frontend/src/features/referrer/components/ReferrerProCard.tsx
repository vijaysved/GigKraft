import {
  Anchor,
  Avatar,
  Badge,
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
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { claimProInvite } from "../../../api/endpoints";
import { getAccessToken } from "../../../api/tokens";
import { fallbackAvatar } from "../../../assets/fallbackAvatars";
import type { ProCardOut } from "../types";
import { RequestReferralModal } from "./RequestReferralModal";

interface Props {
  pro: ProCardOut;
  slug: string;
  referrerName: string;
  allPros: ProCardOut[];
  isFollower: boolean;
  onNeedFollow: () => void;
  highlightedProId?: number;
  claimToken?: string;
}

export function ReferrerProCard({
  pro,
  slug,
  referrerName,
  allPros,
  isFollower,
  onNeedFollow,
  highlightedProId,
  claimToken,
}: Props) {
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const isHighlighted = !!highlightedProId && pro.id === highlightedProId && pro.is_pending;

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isHighlighted) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  async function handleClaim() {
    if (!claimToken) return;
    if (!getAccessToken()) {
      navigate(`/register?claim_token=${claimToken}&returnTo=/us/${slug}/refer`);
      return;
    }
    setClaiming(true);
    try {
      await claimProInvite(claimToken);
      navigate("/pro/account");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not claim invite. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

  function handleRequestClick() {
    if (!isFollower) {
      onNeedFollow();
      return;
    }
    setRequestOpen(true);
  }

  const cardStyle = {
    borderColor: isHighlighted ? "var(--gk-accent-primary)" : "var(--gk-accent-primary)",
    boxShadow: isHighlighted
      ? "0 0 0 2px var(--gk-accent-primary), 0 4px 16px color-mix(in srgb, var(--gk-accent-primary) 30%, transparent)"
      : "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  return (
    <>
      <Card ref={cardRef} withBorder radius="md" p="sm" style={cardStyle}>
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
            src={pro.avatar_url || fallbackAvatar(pro.id)}
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
                    {pro.name.split(" ")[0]}
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
              <button
                onClick={handleRequestClick}
                style={{
                  padding: "3px 11px",
                  background: "var(--gk-brand-gradient)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  transition: "opacity 0.15s",
                  boxShadow: "0 2px 8px -2px var(--gk-accent-primary)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Refer me
              </button>
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

        {isHighlighted && (
          <>
            <Divider my={6} style={{ borderColor: "var(--gk-accent-primary)", opacity: 0.4 }} />
            <button
              onClick={handleClaim}
              disabled={claiming}
              style={{
                width: "100%",
                padding: "7px 14px",
                background: "var(--gk-brand-gradient)",
                color: "#fff",
                border: "none",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                cursor: claiming ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.03em",
                opacity: claiming ? 0.7 : 1,
                transition: "opacity 0.15s",
                boxShadow: "0 2px 8px -2px var(--gk-accent-primary)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {claiming ? "Claiming…" : "Claim your free profile →"}
            </button>
          </>
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
