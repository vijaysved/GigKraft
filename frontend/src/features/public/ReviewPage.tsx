import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconStar, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import {
  DEFAULT_METRICS,
  REC_METRICS,
  encodeRecText,
  getReviewContext,
  loadMessages,
  submitReview,
  type RecMetrics,
  type ReviewContextOut,
} from "../../api/recommendations";

function MetricToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Group
      justify="space-between"
      align="center"
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: `2px solid ${value ? "var(--gk-accent-primary)" : "var(--gk-border)"}`,
        background: value ? "color-mix(in srgb, var(--gk-accent-primary) 8%, transparent)" : "transparent",
        cursor: "pointer",
        transition: "all 0.12s",
      }}
      onClick={() => onChange(!value)}
    >
      <Text size="sm" fw={500}>{label}</Text>
      <Box
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: value ? "var(--gk-accent-primary)" : "var(--gk-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.12s",
        }}
      >
        {value
          ? <IconCheck size={15} color="#fff" />
          : <IconX size={13} color="#fff" style={{ opacity: 0.5 }} />}
      </Box>
    </Group>
  );
}

export function ReviewPage() {
  const { handle, token } = useParams<{ handle: string; token: string }>();

  const [ctx,        setCtx]        = useState<ReviewContextOut | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);

  // Form state
  const [reviewerName,    setReviewerName]    = useState("");
  const [reviewerContact, setReviewerContact] = useState("");
  const [stars,    setStars]   = useState(0);   // 1–5, 0 = unset
  const [hovered,  setHovered] = useState(0);
  const [metrics,  setMetrics] = useState<RecMetrics>({ ...DEFAULT_METRICS });
  const [text,     setText]    = useState("");

  // Revision message from pro (stored locally — needs backend in production)
  const [proMessage, setProMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getReviewContext(token)
      .then((c) => {
        setCtx(c);
        // Pre-fill name from context
        if (c.client_name) setReviewerName(c.client_name.slice(0, 5));
        // Check for revision note from pro
        const msgs = loadMessages(0); // token-based lookup would need backend
        const proMsg = msgs.find((m) => m.from === "pro");
        if (proMsg) setProMessage(proMsg.text);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Invalid or expired link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (!token || !text.trim() || !reviewerName.trim()) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      const encoded = encodeRecText(metrics, text.trim());
      await submitReview(token, { stars, text: encoded, photo_urls: [] });
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitErr(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const metricCount = Object.values(metrics).filter(Boolean).length;
  const canSubmit = text.trim().length >= 10 && reviewerName.trim().length > 0 && stars >= 1;

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={520} maw="100%">
          <Center>
            <GkLogo height={44} />
          </Center>

          <Card withBorder shadow="md" radius="lg" p="lg" bg="var(--gk-bg-surface)">
            {loading && <Center py="xl"><Loader /></Center>}

            {error && (
              <Alert color="red" title="Link not found">
                {error}
              </Alert>
            )}

            {!loading && !error && submitted && (
              <Stack align="center" gap="md" py="lg">
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--gk-brand-gradient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconCheck size={32} color="#fff" />
                </div>
                <Title order={3} ta="center">Thank you!</Title>
                <Text size="sm" c="dimmed" ta="center">
                  Your recommendation has been submitted and is awaiting{" "}
                  <strong>{ctx?.pro_name ?? handle}</strong>'s approval.
                </Text>
              </Stack>
            )}

            {!loading && !error && !submitted && ctx && (
              <Stack gap="md">
                {/* Header */}
                <Stack gap={2}>
                  <Title order={4}>Leave a recommendation</Title>
                  <Text size="sm" c="dimmed">
                    for <strong>{ctx.pro_name}</strong>
                    {ctx.pro_trade ? ` · ${ctx.pro_trade}` : ""}
                    {ctx.job_title ? ` — ${ctx.job_title}` : ""}
                  </Text>
                </Stack>

                {/* Pro revision note */}
                {proMessage && (
                  <Alert color="blue" variant="light" title="Note from the pro">
                    {proMessage}
                  </Alert>
                )}

                <Divider />

                {/* Reviewer identity */}
                <Stack gap="xs">
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                    Your info
                  </Text>
                  <Group gap="sm" grow>
                    <TextInput
                      label="Display name"
                      description="Shown publicly (max 5 characters)"
                      placeholder="Sarah"
                      maxLength={5}
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.currentTarget.value)}
                      required
                    />
                    <TextInput
                      label="Email or phone"
                      description="Not shown publicly"
                      placeholder="you@email.com or +1 555 000 0000"
                      value={reviewerContact}
                      onChange={(e) => setReviewerContact(e.currentTarget.value)}
                    />
                  </Group>
                </Stack>

                <Divider />

                {/* Star rating */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      Overall rating
                    </Text>
                    {stars > 0 && (
                      <Text size="xs" c="dimmed">
                        {["", "Poor", "Fair", "Good", "Great", "Excellent"][stars]}
                      </Text>
                    )}
                  </Group>
                  <Group gap={6}>
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
                            ? <IconStar size={32} fill="var(--gk-accent-primary)" color="var(--gk-accent-primary)" />
                            : <IconStar size={32} color="var(--gk-border)" />}
                        </Box>
                      );
                    })}
                  </Group>
                </Stack>

                <Divider />

                {/* Metrics */}
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      How did they do?
                    </Text>
                    <Badge variant="light" size="sm">
                      {metricCount} / {REC_METRICS.length} yes
                    </Badge>
                  </Group>
                  <Stack gap="xs">
                    {REC_METRICS.map(({ key, label }) => (
                      <MetricToggle
                        key={key}
                        label={label}
                        value={metrics[key]}
                        onChange={(v) => setMetrics((m) => ({ ...m, [key]: v }))}
                      />
                    ))}
                  </Stack>
                </Stack>

                <Divider />

                {/* Written review */}
                <Stack gap="xs">
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                    Written review
                  </Text>
                  <Textarea
                    placeholder={`Tell others about your experience with ${ctx.pro_name}…`}
                    minRows={4}
                    autosize
                    maxLength={1000}
                    value={text}
                    onChange={(e) => setText(e.currentTarget.value)}
                    description={`${text.length}/1000 · minimum 10 characters`}
                  />
                </Stack>

                {submitErr && <Alert color="red" variant="light">{submitErr}</Alert>}

                <Button
                  size="md"
                  loading={submitting}
                  disabled={!canSubmit}
                  style={canSubmit ? { background: "var(--gk-brand-gradient)" } : undefined}
                  onClick={() => void handleSubmit()}
                >
                  Submit recommendation
                </Button>
              </Stack>
            )}
          </Card>
        </Stack>
      </Center>
    </Box>
  );
}
