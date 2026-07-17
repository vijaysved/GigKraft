import { Alert, Avatar, Badge, Box, Button, Divider, Group, Modal, Progress, Stack, Text, Textarea, Tooltip } from "@mantine/core";
import { IconCheck, IconMail, IconPhone, IconStar } from "@tabler/icons-react";
import { useState } from "react";

import { fallbackAvatar } from "../assets/fallbackAvatars";
import {
  DEFAULT_METRICS,
  encodeRecText,
  ratePro,
  type RecMetricKey,
  type RecMetrics,
} from "../api/recommendations";
import { useAuth } from "../auth/AuthContext";
import { formatPhone, maskEmail, maskPhone } from "../utils/format";
import { CollapsibleTags } from "./CollapsibleTags";
import type { ProviderCardFavorite } from "./ProviderCard";
import { SpeedometerGauge } from "./SpeedometerGauge";

interface QualityBreakdownRow {
  label: string;
  pct: number | null;
}

/** The five Quality-of-Work categories shown in the breakdown (and the only
 * things a rater is asked about, each as a Yes/No). Keys that share a category
 * move together so pro_metrics_math.py's existing per-key averaging still
 * produces the right percentage without any backend changes. */
const RATING_CATEGORIES: { label: string; keys: RecMetricKey[] }[] = [
  { label: "Schedule Adherence", keys: ["punctuality"] },
  { label: "Professionalism & Cleanliness", keys: ["cleanliness"] },
  { label: "Pricing Transparency", keys: ["clear_rates", "written_estimates", "material_policy"] },
  { label: "Communication Quality", keys: ["communication"] },
  { label: "Re-hire Intent", keys: ["rehire_intent"] },
];

/** Exactly one of proId/referrerProId — whichever this card actually
 * represents (design-specs/12.OffPlatformProRatings.md §4). Omit entirely to
 * hide the "Rate" action (e.g. surfaces not ready to support it yet). */
interface RatingTarget {
  proId?: number;
  referrerProId?: number;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  avatarSeed: number | string;
  name: string;
  tier: "pro" | "referred";
  trade?: string | null;
  phone?: string | null;
  email?: string | null;
  endorsement?: string;
  endorsementAttribution?: string;
  tags?: string[];
  onTagClick?: (tag: string) => void;
  blurred?: boolean;
  favorite?: ProviderCardFavorite;
  popularityScore?: number | null;
  qualityScore?: number | null;
  recommendedCount?: number;
  usedCount?: number;
  reviewCount?: number;
  qualityBreakdown?: QualityBreakdownRow[];
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  ratingTarget?: RatingTarget;
}

function RatingForm({ target, onDone }: { target: RatingTarget; onDone: () => void }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [metrics, setMetrics] = useState<RecMetrics>({ ...DEFAULT_METRICS });
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (stars < 1) {
      setError("Pick a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await ratePro({
        pro_id: target.proId,
        referrer_pro_id: target.referrerProId,
        stars,
        text: encodeRecText(metrics, text.trim()),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit rating.");
    } finally {
      setSubmitting(false);
    }
  }

  function answerCategory(label: string, keys: RecMetricKey[], value: boolean) {
    setAnswered((prev) => new Set(prev).add(label));
    setMetrics((m) => {
      const next = { ...m };
      for (const k of keys) next[k] = value;
      return next;
    });
  }

  return (
    <Stack gap="sm">
      <Divider label="Rate this pro" labelPosition="center" style={{ borderColor: "var(--gk-accent-primary)" }} />

      <Group gap={4} justify="center">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= (hovered || stars);
          return (
            <Box
              key={n}
              style={{ cursor: "pointer", lineHeight: 0 }}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
            >
              {filled
                ? <IconStar size={26} fill="var(--gk-accent-primary)" color="var(--gk-accent-primary)" />
                : <IconStar size={26} color="var(--gk-border)" />}
            </Box>
          );
        })}
      </Group>

      <Stack gap={6}>
        {RATING_CATEGORIES.map(({ label, keys }) => {
          const isAnswered = answered.has(label);
          const value = metrics[keys[0]];
          return (
            <Group key={label} justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm">{label}</Text>
              <Group gap={6} wrap="nowrap">
                <Button
                  size="xs"
                  radius="xl"
                  variant={isAnswered && value ? "filled" : "outline"}
                  style={isAnswered && value ? { background: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" } : { borderColor: "var(--gk-border)" }}
                  onClick={() => answerCategory(label, keys, true)}
                >
                  Yes
                </Button>
                <Button
                  size="xs"
                  radius="xl"
                  variant={isAnswered && !value ? "filled" : "outline"}
                  style={isAnswered && !value ? { background: "var(--gk-border)" } : { borderColor: "var(--gk-border)" }}
                  onClick={() => answerCategory(label, keys, false)}
                >
                  No
                </Button>
              </Group>
            </Group>
          );
        })}
      </Stack>

      <Textarea
        placeholder="Add a note (optional)…"
        minRows={2}
        autosize
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      {error && <Alert color="red" variant="light">{error}</Alert>}

      <Group justify="flex-end" gap="sm">
        <Button
          size="xs"
          radius="xl"
          loading={submitting}
          disabled={stars < 1}
          style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
          onClick={() => void handleSubmit()}
        >
          Submit rating
        </Button>
      </Group>
    </Stack>
  );
}

/** Surface-agnostic "expanded card" — opened by tapping a compact ProviderCard.
 * Shows the full endorsement/tags plus the two Popularity/Quality-of-Work
 * gauges and their breakdown (design-specs/11.ContactCardUpdate.md §7), and
 * (when `ratingTarget` is passed) a self-service "Rate" action — any logged-in
 * user can rate an on-platform pro or an off-platform referred contact the
 * same way (design-specs/12.OffPlatformProRatings.md §4). Used by Referrer and
 * Community pro cards — each passes its own pro's fields rather than sharing a
 * feature-specific "pro" type.*/
export function ProviderDetailModal({
  opened,
  onClose,
  avatarUrl,
  avatarSeed,
  name,
  tier,
  trade,
  phone,
  email,
  endorsement,
  endorsementAttribution,
  tags,
  onTagClick,
  blurred,
  favorite,
  popularityScore,
  qualityScore,
  recommendedCount,
  usedCount,
  reviewCount,
  qualityBreakdown,
  primaryAction,
  ratingTarget,
}: Props) {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";
  const [rating, setRating] = useState(false);
  const [ratedJustNow, setRatedJustNow] = useState(false);
  const hasRealAvatar = !!avatarUrl;
  const hasGauges = popularityScore !== undefined || qualityScore !== undefined;

  function handleClose() {
    setRating(false);
    setRatedJustNow(false);
    onClose();
  }

  const compact = !rating && !ratedJustNow;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={name}
      centered
      size={rating ? "lg" : "md"}
      styles={{ title: { color: "var(--gk-accent-primary)", fontWeight: 700, fontSize: "1.1rem" } }}
    >
      <Stack gap={compact ? "sm" : "md"}>
        <Group gap={16} align="flex-start" wrap="nowrap">
          <Avatar
            src={avatarUrl || fallbackAvatar(avatarSeed)}
            radius={hasRealAvatar ? "sm" : "50%"}
            size={80}
            style={{ flexShrink: 0, border: "2px solid var(--gk-accent-primary)", filter: blurred ? (hasRealAvatar ? "blur(8px)" : "blur(2px)") : undefined }}
          >
            {name[0]?.toUpperCase()}
          </Avatar>

          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} wrap="wrap">
              <Badge
                size="xs"
                variant="filled"
                style={{
                  backgroundColor: tier === "pro" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)",
                  color: tier === "pro" ? "var(--gk-accent-secondary)" : "var(--gk-accent-primary)",
                }}
              >
                {tier === "pro" ? "Paid Pro" : "Pro"}
              </Badge>
              {trade && <Text size="sm" c="dimmed">{trade}</Text>}
            </Group>

            {phone && (
              <Group gap={6} wrap="nowrap">
                <IconPhone size={13} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
                <Text size="sm">{blurred ? maskPhone(phone) : formatPhone(phone)}</Text>
              </Group>
            )}

            {email && (
              <Group gap={6} wrap="nowrap">
                <IconMail size={13} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
                <Text size="sm" truncate>{blurred ? maskEmail(email) : email}</Text>
              </Group>
            )}
          </Stack>
        </Group>

        {hasGauges && (
          <>
            <Divider style={{ borderColor: "var(--gk-accent-primary)" }} />
            <Group justify="center" gap={40}>
              <SpeedometerGauge value={popularityScore ?? null} label="Popularity" size={80} />
              <SpeedometerGauge value={qualityScore ?? null} label="Quality of Work" size={80} />
            </Group>
            {(recommendedCount != null || usedCount != null || reviewCount != null) && (
              <Text size="xs" c="dimmed" ta="center">
                {recommendedCount ?? 0} recommended · {usedCount ?? 0} used · {reviewCount ?? 0} reviews
              </Text>
            )}
            {qualityBreakdown && qualityBreakdown.length > 0 && (
              <Stack gap={6}>
                {qualityBreakdown.map(({ label, pct }) => (
                  <Stack key={label} gap={2}>
                    <Group justify="space-between">
                      <Text size="xs">{label}</Text>
                      <Text size="xs" c="dimmed">{pct == null ? "Not enough data" : `${pct}%`}</Text>
                    </Group>
                    <Progress value={pct ?? 0} size="sm" color={pct == null ? "gray" : undefined} />
                  </Stack>
                ))}
              </Stack>
            )}
          </>
        )}

        {endorsement && (
          <Text size="sm" fs="italic" c="dimmed">
            "{endorsement}"{endorsementAttribution ? ` — ${endorsementAttribution}` : ""}
          </Text>
        )}

        {tags && tags.length > 0 && onTagClick && <CollapsibleTags tags={tags} onTagClick={onTagClick} />}

        {(favorite || primaryAction || ratingTarget) && (
          <Group justify="flex-end" gap="sm">
            {favorite && (
              <Button
                variant="subtle"
                size="xs"
                radius="xl"
                disabled={!favorite.isAuthenticated}
                onClick={favorite.onToggle}
              >
                {favorite.isFavorited ? "Remove from favorites" : "Save to favorites"}
              </Button>
            )}
            {ratingTarget && !ratedJustNow && (
              <Tooltip label="Sign in to rate this pro" disabled={isAuthenticated}>
                <Box>
                  <Button
                    variant="subtle"
                    size="xs"
                    radius="xl"
                    disabled={!isAuthenticated || rating}
                    onClick={() => setRating(true)}
                  >
                    Rate
                  </Button>
                </Box>
              </Tooltip>
            )}
            {primaryAction && (
              <Button
                size="xs"
                radius="xl"
                disabled={primaryAction.disabled}
                style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
          </Group>
        )}

        {ratedJustNow && (
          <Alert color="green" variant="light" icon={<IconCheck size={16} />}>
            Rating submitted — pending approval before it counts toward this pro's score.
          </Alert>
        )}

        {rating && ratingTarget && (
          <RatingForm
            target={ratingTarget}
            onDone={() => { setRating(false); setRatedJustNow(true); }}
          />
        )}
      </Stack>
    </Modal>
  );
}
