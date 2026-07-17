import { Alert, Avatar, Button, Divider, Group, Loader, Modal, SimpleGrid, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

import { useAuth } from "../../../auth/AuthContext";
import { GoogleSignInButton } from "../../../components/GoogleSignInButton";
import { loadAvatar, loadGooglePictureUrl } from "../../../hooks/useProAvatar";
import { brandCssVars } from "../../../theme/themes";
import { communityFetch } from "../hooks/useCommunity";

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  communityName: string;
  theme?: string | null;
  /** The viewer's current standing in this Community — lets the modal explain
   * up front that submitting will also add them as a pending member when
   * they aren't one yet. `"none"` or `null`/`undefined` both mean "not yet". */
  viewerStatus?: string | null;
  /** Fired after a successful submit that also created/updated the viewer's
   * membership — lets the page refetch so viewer_status reflects it. */
  onJoined?: () => void;
}

interface LinkPreview {
  title: string;
  description: string;
  image: string;
}

const emptyForm = { name: "", trade: "", phone: "", email: "", url: "", endorsement: "" };

/** Empty string is valid (the field is optional) — only a non-empty, malformed URL is an error. */
function validateUrl(v: string): string | null {
  if (!v.trim()) return null;
  try {
    const parsed = new URL(v.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? null
      : "Enter a valid website link (starting with http:// or https://).";
  } catch {
    return "Enter a valid website link (starting with http:// or https://).";
  }
}

/** Anyone can fill out a pro suggestion for the Community's list; signing in
 * (and self-serve-joining, if not already a Member) is only required at Submit.
 * The suggestion lands pending Owner/Moderator approval, not straight onto the
 * public page. design-specs/13.RecommendAPro-LandingIntent.md §4 FR-3. */
export function RecommendProModal({ opened, onClose, slug, communityName, theme, viewerStatus, onJoined }: Props) {
  const { status, user, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [membershipPending, setMembershipPending] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  function set(field: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "url") {
      setPreview(null);
      setPreviewError(null);
    }
  }

  function handleClose() {
    setDone(false);
    setMembershipPending(false);
    setError(null);
    setForm(emptyForm);
    setUrlError(null);
    setPreview(null);
    setPreviewError(null);
    onClose();
  }

  async function handlePreview() {
    const url = form.url.trim();
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}/link-preview`, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as LinkPreview & { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Couldn't load a preview for that link.");
      setPreview(data);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Couldn't load a preview for that link.");
    } finally {
      setPreviewLoading(false);
    }
  }

  /** Returns an error message if the form isn't ready to submit, else null. */
  function validateForm(): string | null {
    if (!form.name.trim()) return "Please enter the pro's name.";
    if (!form.phone.trim() && !form.email.trim()) return "Provide a phone number or email for this pro.";
    const urlErr = validateUrl(form.url);
    if (urlErr) {
      setUrlError(urlErr);
      return urlErr;
    }
    return null;
  }

  async function submitRecommendation() {
    setSubmitting(true);
    setError(null);
    try {
      // Self-serve-join first (no-op if already a Member) — recommend-pro requires
      // Membership, and the form itself is open to non-Members too. A brand-new,
      // not-pre-vetted joiner lands "pending" here rather than "joined" — the owner
      // then has two separate things to approve: the membership and the suggestion.
      const joinRes = await communityFetch(`/api/communities/${slug}/join`, { method: "POST" });
      const joinData = joinRes.ok ? (await joinRes.json() as { status?: string }) : null;
      const pendingMembership = joinData?.status === "pending";

      const res = await communityFetch(`/api/communities/${slug}/recommend-pro`, {
        method: "POST",
        body: JSON.stringify({ ...form, url: form.url.trim() }),
      });
      const data = await res.json() as { detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Could not submit your suggestion.");
      setMembershipPending(pendingMembership);
      setDone(true);
      if (joinData) onJoined?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    const err = validateForm();
    if (err) { setError(err); return; }
    await submitRecommendation();
  }

  /** Signs in only — submission is a separate, explicit click once the person
   * can see whose account ("Signed in as ...") is about to submit this. */
  async function handleGoogleSignIn(idToken: string) {
    const err = validateForm();
    if (err) { setError(err); return; }
    setError(null);
    try {
      await loginWithGoogle(idToken, "member");
    } catch {
      setError("Google sign-in failed.");
    }
  }

  const urlLooksValid = !!form.url.trim() && !validateUrl(form.url);
  const needsToJoin = viewerStatus == null || viewerStatus === "none";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={700} c="var(--gk-accent-primary)">Recommend a Pro</Text>}
      centered
      size="750px"
      radius="md"
      styles={{
        content: {
          ...brandCssVars(theme),
          border: "1.5px solid var(--gk-accent-primary)",
          boxShadow: "6px 6px 0 var(--gk-accent-secondary)",
          borderRadius: 10,
        },
        header: { ...brandCssVars(theme) },
        body: { paddingTop: 4 },
      }}
      closeButtonProps={{
        size: "sm",
        style: {
          color: "var(--gk-accent-primary)",
          background: "color-mix(in srgb, var(--gk-accent-secondary) 14%, transparent)",
        },
      }}
    >
      <Stack gap="sm">
        <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} />
        {done ? (
          <Stack gap="sm">
            <Text size="sm">
              {membershipPending
                ? `Thanks! We've sent both your membership request and your pro suggestion to ${communityName}'s owner for review — you'll hear back once they're approved.`
                : `Thanks! Your suggestion has been sent to ${communityName}'s owner for review — you'll hear back once it's added.`}
            </Text>
            <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={handleClose}>Done</Button>
          </Stack>
        ) : (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Know a great pro? Suggest them for {communityName}'s list — the owner reviews every suggestion before it goes live.
            </Text>
            {needsToJoin && status !== "authenticated" && (
              <Alert color="blue" variant="light">
                Sign in with Google to join {communityName} and submit this suggestion — the owner reviews both your membership and the pro.
              </Alert>
            )}
            {needsToJoin && status === "authenticated" && (
              <Alert color="blue" variant="light">
                Submitting will also add you to {communityName} as a pending member for the owner to approve.
              </Alert>
            )}
            <SimpleGrid cols={2} spacing="sm">
              <TextInput
                label="Pro's name"
                placeholder="e.g. John's Plumbing"
                value={form.name}
                onChange={(e) => set("name", e.currentTarget.value)}
                required
              />
              <TextInput
                label="Trade (optional)"
                placeholder="e.g. Plumber"
                value={form.trade}
                onChange={(e) => set("trade", e.currentTarget.value)}
              />
              <TextInput
                label="Phone"
                placeholder="(555) 123-4567"
                value={form.phone}
                onChange={(e) => set("phone", e.currentTarget.value)}
              />
              <TextInput
                label="Email"
                placeholder="pro@example.com"
                value={form.email}
                onChange={(e) => set("email", e.currentTarget.value)}
              />
            </SimpleGrid>
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <TextInput
                label="Website or profile link (optional)"
                placeholder="https://example.com"
                value={form.url}
                error={urlError}
                onChange={(e) => set("url", e.currentTarget.value)}
                onBlur={() => setUrlError(validateUrl(form.url))}
                style={{ flex: 1 }}
              />
              {urlLooksValid && (
                <Button
                  variant="light"
                  size="sm"
                  loading={previewLoading}
                  leftSection={!previewLoading ? <IconEye size={15} /> : undefined}
                  onClick={() => void handlePreview()}
                >
                  Preview
                </Button>
              )}
            </Group>
            {previewLoading && (
              <Group gap="xs"><Loader size="xs" /><Text size="xs" c="dimmed">Loading preview…</Text></Group>
            )}
            {previewError && (
              <Text size="xs" c="dimmed">Couldn't load a preview for that link — you can still submit.</Text>
            )}
            {preview && (
              <div style={{
                borderRadius: 12,
                padding: 3,
                background: "var(--gk-brand-gradient)",
              }}>
                <div style={{ borderRadius: 10, background: "var(--gk-bg-surface)", padding: "12px 14px" }}>
                  <Group gap="md" align="center" wrap="nowrap">
                    <Avatar src={preview.image || undefined} size={48} radius="md" color="teal" style={{ border: "2px solid var(--gk-border)", flexShrink: 0 }}>
                      {(!preview.image && form.name[0]?.toUpperCase()) || "?"}
                    </Avatar>
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="sm" truncate>{form.name || "This pro"}</Text>
                      <Text size="xs" c="dimmed" truncate>{form.trade || form.phone || form.email}</Text>
                      <Text size="xs" fw={600} truncate>{preview.title || form.url}</Text>
                      {preview.description && <Text size="xs" c="dimmed" lineClamp={2}>{preview.description}</Text>}
                    </Stack>
                  </Group>
                </div>
              </div>
            )}
            <Textarea
              label="Comments (optional)"
              maxLength={200}
              value={form.endorsement}
              onChange={(e) => set("endorsement", e.currentTarget.value)}
              minRows={2}
            />
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              {status === "authenticated" && user && (
                <Group gap={8} wrap="nowrap">
                  <Avatar src={loadAvatar() ?? loadGooglePictureUrl() ?? undefined} size={28} radius="xl">
                    {user.first_name?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <Text size="xs" c="dimmed">Signed in as {user.first_name} {user.last_name}</Text>
                </Group>
              )}
              <Group justify="flex-end" gap="xs" ml="auto">
                <Button variant="subtle" size="xs" radius="xl" onClick={handleClose}>Cancel</Button>
                {status === "authenticated" ? (
                  <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void handleSubmit()}>
                    Submit Suggestion
                  </Button>
                ) : (
                  <div style={{ width: 220 }}>
                    <GoogleSignInButton label="signup_with" shape="pill" size="medium" fullWidth onSuccess={handleGoogleSignIn} onError={setError} />
                  </div>
                )}
              </Group>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
