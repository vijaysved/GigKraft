import {
  Anchor,
  Badge,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
  TextInput,
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
import { CollapsibleTags } from "../../../components/CollapsibleTags";
import { ProviderCard, type ProviderCardFavorite } from "../../../components/ProviderCard";
import type { ProCardOut } from "../types";
import { RequestReferralModal } from "./RequestReferralModal";
import { formatPhone, maskEmail, maskPhone } from "../../../utils/format";

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
  onTagClick: (tag: string) => void;
  favorite?: ProviderCardFavorite;
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

/** One-line note input shown in the share popovers — prepended to the top of the shared message */
function ShareNoteForm({
  note,
  onNoteChange,
  onConfirm,
  confirmLabel,
}: {
  note: string;
  onNoteChange: (v: string) => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <Stack gap={6}>
      <TextInput
        size="xs"
        placeholder="Add a one-line note (optional)"
        value={note}
        onChange={(e) => onNoteChange(e.currentTarget.value)}
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); }}
      />
      <button
        type="button"
        onClick={onConfirm}
        style={{
          padding: "5px 12px",
          background: "var(--gk-brand-gradient)",
          color: "#fff",
          border: "none",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {confirmLabel}
      </button>
    </Stack>
  );
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
  onTagClick,
  favorite,
}: Props) {
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notePopover, setNotePopover] = useState<"whatsapp" | "sms" | "copy" | null>(null);
  const [note, setNote] = useState("");

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
    const lines: string[] = [];
    if (note.trim()) lines.push(note.trim(), "");
    lines.push(`👋 ${pro.name}${pro.trade ? ` — ${pro.trade}` : ""}`);
    if (pro.phone) lines.push(`📞 ${formatPhone(pro.phone)}`);
    if (pro.email) lines.push(`✉️ ${pro.email}`);
    if (pro.endorsement) lines.push(`"${pro.endorsement}" — ${referrerName}`);
    lines.push("", `👀 Check out all of ${referrerName}'s trusted pros: ${pro.short_url}`);
    return lines.join("\n");
  }

  function closeNotePopover() {
    setNotePopover(null);
    setNote("");
  }

  function confirmWhatsAppShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, "_blank", "noopener,noreferrer");
    closeNotePopover();
  }

  function confirmSmsShare() {
    window.open(`sms:?body=${encodeURIComponent(buildShareText())}`, "_blank", "noopener,noreferrer");
    closeNotePopover();
  }

  function confirmCopyShareText() {
    void navigator.clipboard.writeText(buildShareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    closeNotePopover();
  }

  return (
    <>
      <ProviderCard
        cardRef={cardRef}
        highlighted={isHighlighted}
        avatarUrl={pro.avatar_url}
        avatarSeed={pro.id}
        name={pro.name}
        tier={pro.is_on_platform ? "pro" : "referred"}
        isPending={pro.is_pending}
        trade={pro.trade || null}
        respondsIn={pro.responds_in}
        favorite={pro.linked_pro_id != null ? favorite : undefined}
        topRightAction={
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
        }
      >
        {/* Contact — plain text always visible, tap-to-call only after referral sent */}
        <Stack gap={1} mb={4} style={{ position: "relative", zIndex: 1 }}>
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
          <Group gap={6} mb={4} style={{ position: "relative", zIndex: 1 }}>
            <Popover
              opened={notePopover === "whatsapp"}
              onChange={(v) => setNotePopover(v ? "whatsapp" : null)}
              withArrow position="bottom" width={240} shadow="md"
            >
              <Popover.Target>
                <span>
                  <ShareIconBtn label="Share on WhatsApp" onClick={() => setNotePopover("whatsapp")} color="#25D366">
                    <IconBrandWhatsapp size={14} />
                  </ShareIconBtn>
                </span>
              </Popover.Target>
              <Popover.Dropdown>
                <ShareNoteForm note={note} onNoteChange={setNote} onConfirm={confirmWhatsAppShare} confirmLabel="Open WhatsApp" />
              </Popover.Dropdown>
            </Popover>

            <Popover
              opened={notePopover === "sms"}
              onChange={(v) => setNotePopover(v ? "sms" : null)}
              withArrow position="bottom" width={240} shadow="md"
            >
              <Popover.Target>
                <span>
                  <ShareIconBtn label="Share via Text" onClick={() => setNotePopover("sms")} color="var(--gk-accent-primary)">
                    <IconMessage size={14} />
                  </ShareIconBtn>
                </span>
              </Popover.Target>
              <Popover.Dropdown>
                <ShareNoteForm note={note} onNoteChange={setNote} onConfirm={confirmSmsShare} confirmLabel="Open Text" />
              </Popover.Dropdown>
            </Popover>

            <Popover
              opened={notePopover === "copy"}
              onChange={(v) => setNotePopover(v ? "copy" : null)}
              withArrow position="bottom" width={240} shadow="md"
            >
              <Popover.Target>
                <span>
                  <ShareIconBtn
                    label={copied ? "Copied!" : "Copy contact info"}
                    onClick={() => setNotePopover("copy")}
                    color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-primary)"}
                  >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ShareIconBtn>
                </span>
              </Popover.Target>
              <Popover.Dropdown>
                <ShareNoteForm note={note} onNoteChange={setNote} onConfirm={confirmCopyShareText} confirmLabel="Copy" />
              </Popover.Dropdown>
            </Popover>

            {pro.click_count != null && (
              <Text size="xs" c="dimmed" ml={2}>
                {pro.click_count} click{pro.click_count === 1 ? "" : "s"}
              </Text>
            )}
          </Group>
        )}

        {pro.endorsement && (
          <Text size="xs" fs="italic" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
            "{pro.endorsement}" — {referrerName}
          </Text>
        )}

        {(pro.is_licensed || pro.is_insured) && (
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
          </Group>
        )}

        <CollapsibleTags tags={pro.tags} onTagClick={onTagClick} />

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
      </ProviderCard>

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
