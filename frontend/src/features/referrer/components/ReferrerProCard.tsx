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
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { claimProInvite } from "../../../api/endpoints";
import { getAccessToken } from "../../../api/tokens";
import { API_BASE_URL } from "../../../config";
import { fallbackAvatar } from "../../../assets/fallbackAvatars";
import type { ProCardOut } from "../types";
import { RequestReferralModal } from "./RequestReferralModal";
import { formatPhone } from "../../../utils/format";
import { toCamelTag } from "../../../utils/tags";

interface Props {
  pro: ProCardOut;
  slug: string;
  referrerName: string;
  allPros: ProCardOut[];
  isFollower: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  onNeedFollow: () => void;
  highlightedProId?: number;
  claimToken?: string;
}

/** Small round icon-only button used for the per-pro share row */
function ShareIconBtn({
  label,
  onClick,
  color,
  children,
}: {
  label: string;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        border: "1.5px solid var(--gk-border)",
        borderRadius: "50%",
        background: "transparent",
        cursor: "pointer",
        color,
        fontFamily: "inherit",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </button>
  );
}

/** Partially masks a phone number, e.g. "(925) 555-1234" -> "(925) ***-1234" */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone.length > 2 ? `${phone.slice(0, 2)}***` : "***";
  const area = digits.slice(-10, -7);
  const last4 = digits.slice(-4);
  return `(${area}) ***-${last4}`;
}

/** Partially masks an email, e.g. "john.doe@gmail.com" -> "j***e@g**.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 2 ? `${local[0]}**` : `${local[0]}***${local[local.length - 1]}`;
  const domainParts = domain.split(".");
  const tld = domainParts.pop() ?? "";
  const maskedDomain = `${domainParts.join(".")[0] ?? ""}**`;
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}

export function ReferrerProCard({
  pro,
  slug,
  referrerName,
  allPros,
  isFollower,
  isAuthenticated,
  isOwner,
  onNeedFollow,
  highlightedProId,
  claimToken,
}: Props) {
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const hasRealAvatar = !!pro.avatar_url;
  const [copied, setCopied] = useState(false);

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

  function buildShareText(): string {
    // Use the backend social-preview endpoint (not the frontend SPA URL) so WhatsApp/SMS
    // link previews scrape real server-rendered OG tags and show the referrer's profile pic.
    const shareUrl = `${API_BASE_URL}/us/${slug}/refer`;
    const lines: string[] = [`👋 ${pro.name}${pro.trade ? ` — ${pro.trade}` : ""}`];
    lines.push(`Recommended by ${referrerName} on GigKraft`);
    if (pro.phone) lines.push(`📞 ${formatPhone(pro.phone)}`);
    if (pro.email) lines.push(`✉️ ${pro.email}`);
    if (pro.endorsement) lines.push(`"${pro.endorsement}" — ${referrerName}`);
    lines.push("", `👀 Check out all of ${referrerName}'s trusted pros: ${shareUrl}`);
    return lines.join("\n");
  }

  function openWhatsAppShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, "_blank", "noopener,noreferrer");
  }

  function openSmsShare() {
    window.open(`sms:?body=${encodeURIComponent(buildShareText())}`, "_blank", "noopener,noreferrer");
  }

  function handleCopyShareText() {
    void navigator.clipboard.writeText(buildShareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            style={{
              flexShrink: 0,
              border: "2px solid var(--gk-accent-primary)",
              filter: !isAuthenticated ? "blur(4px)" : !hasRealAvatar ? "blur(2px) grayscale(40%)" : undefined,
              opacity: isAuthenticated && !hasRealAvatar ? 0.55 : undefined,
            }}
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
                    <Badge
                      size="xs"
                      variant="filled"
                      style={{
                        flexShrink: 0,
                        backgroundColor: "var(--gk-accent-primary)",
                        color: "var(--gk-accent-secondary)",
                      }}
                    >
                      Pending
                    </Badge>
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
                {!isAuthenticated && pro.phone ? (
                  <Text size="xs">{maskPhone(pro.phone)}</Text>
                ) : pro.tap_to_call && pro.phone ? (
                  <Anchor href={`tel:${pro.phone}`} size="xs">{formatPhone(pro.phone)}</Anchor>
                ) : (
                  <Text size="xs" c={pro.phone ? undefined : "dimmed"}>{pro.phone ? formatPhone(pro.phone) : "—"}</Text>
                )}
              </Group>
              <Group gap={4}>
                <IconMail size={11} color="var(--gk-accent-primary)" />
                <Text size="xs" c={pro.email ? undefined : "dimmed"}>
                  {!isAuthenticated && pro.email ? maskEmail(pro.email) : pro.email || "—"}
                </Text>
              </Group>
              {pro.city && (
                <Badge
                  size="xs"
                  variant="filled"
                  leftSection={<IconMapPin size={10} />}
                  style={{
                    textTransform: "none",
                    alignSelf: "flex-start",
                    backgroundColor: "var(--gk-accent-primary)",
                    color: "var(--gk-accent-secondary)",
                  }}
                >
                  {pro.city}
                </Badge>
              )}
            </Stack>

            {isOwner && (
              <Group gap={6} mt={4}>
                <ShareIconBtn label="Share on WhatsApp" onClick={openWhatsAppShare} color="#25D366">
                  <IconBrandWhatsapp size={14} />
                </ShareIconBtn>
                <ShareIconBtn label="Share via Text" onClick={openSmsShare} color="var(--gk-accent-primary)">
                  <IconMessage size={14} />
                </ShareIconBtn>
                <ShareIconBtn
                  label={copied ? "Copied!" : "Copy contact info"}
                  onClick={handleCopyShareText}
                  color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-primary)"}
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ShareIconBtn>
              </Group>
            )}
          </Stack>
        </Group>

        {pro.endorsement && (
          <Text size="xs" fs="italic" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
            "{pro.endorsement}" — {referrerName}
          </Text>
        )}

        {(pro.is_licensed || pro.is_insured || pro.tags.length > 0) && (
          <Group gap={4} mb={4} style={{ position: "relative", zIndex: 1 }}>
            {pro.is_licensed && (
              <Badge
                size="xs"
                variant="filled"
                leftSection={<IconShieldCheck size={10} />}
                style={{ backgroundColor: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" }}
              >
                Licensed
              </Badge>
            )}
            {pro.is_insured && (
              <Badge
                size="xs"
                variant="filled"
                leftSection={<IconShieldCheck size={10} />}
                style={{ backgroundColor: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" }}
              >
                Insured
              </Badge>
            )}
            {pro.tags.map((t) => (
              <Badge
                key={t}
                size="xs"
                variant="filled"
                style={{
                  textTransform: "none",
                  backgroundColor: "var(--gk-accent-secondary)",
                  color: "var(--gk-accent-primary)",
                }}
              >
                #{toCamelTag(t)}
              </Badge>
            ))}
          </Group>
        )}

        {pro.request_status && (
          <>
            <Divider my={4} style={{ borderColor: "var(--gk-accent-secondary)", opacity: 0.6 }} />
            <Badge
              size="xs"
              variant="filled"
              style={
                pro.request_status === "sent"
                  ? { backgroundColor: "var(--gk-accent-secondary)", color: "var(--gk-accent-primary)" }
                  : { backgroundColor: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" }
              }
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
