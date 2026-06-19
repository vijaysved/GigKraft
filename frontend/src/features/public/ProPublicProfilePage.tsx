import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconLink,
  IconLock,
  IconMail,
  IconMapPin,
  IconMessage,
  IconSend,
  IconStars,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { createAnonymousLead, createLead, getKraftsByPro, getProByHandle, trackKraftClick, trackKraftImpression, trackProfileView, trackProPageView, type KraftPublicOut, type ProOut } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { GkLogo } from "../../brand/GkLogo";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { KraftCard } from "../../components/KraftCard";
import { ReviewsSection } from "../../components/ReviewsSection";

const TIMELINE_OPTIONS = ["ASAP", "Within a week", "This month", "Within 3 months", "Just exploring"];

const WALLPAPERS = [
  "url('/brand/gigkraft-wallpaper.png') center/cover no-repeat",
  "linear-gradient(135deg, #0D1B30 0%, #1B3D5C 100%)",
  "linear-gradient(135deg, #7A3D18 0%, #D4713A 100%)",
  "linear-gradient(135deg, #006058 0%, #00A896 100%)",
  "linear-gradient(135deg, #120900 0%, #3D1F00 100%)",
];

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProPublicProfilePage() {
  const { id: handle } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { status, user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pro, setPro] = useState<ProOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [krafts, setKrafts] = useState<KraftPublicOut[]>([]);

  const isLoggedIn = status === "authenticated";
  const profileUrl = window.location.href;

  // ── § 1.1 Anonymous Draft Hook ─────────────────────────────────────────────
  // Draft preserved in a ref so it survives the auth modal lifecycle.
  const draftRef = useRef("");
  const [draftText, setDraftText] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTimeline, setDraftTimeline] = useState<string | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  // Inject OG meta tags so sharing picks up name / avatar / description
  useEffect(() => {
    if (!pro) return;
    const desc = [
      pro.primary_trade,
      pro.stats.recs_approved ? `${pro.stats.recs_approved} recommendations` : null,
      pro.stats.avg_stars != null ? `${pro.stats.avg_stars.toFixed(1)}★ avg rating` : null,
    ].filter(Boolean).join(" · ");

    function setMeta(property: string, content: string) {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    document.title = `${pro.name} · GigKraft`;
    setMeta("og:title", `${pro.name} on GigKraft`);
    setMeta("og:description", desc || "Verified pro on GigKraft");
    setMeta("og:url", profileUrl);
    setMeta("og:type", "profile");
    if (pro.avatar_url) setMeta("og:image", pro.avatar_url);

    return () => { document.title = "GigKraft"; };
  }, [pro, profileUrl]);

  function handleWhatsAppShare() {
    if (!pro) return;
    const lines = [
      `👷 *${pro.name}* on GigKraft`,
      pro.primary_trade ? `🔧 ${pro.primary_trade}` : null,
      pro.stats.recs_approved ? `⭐ ${pro.stats.recs_approved} recommendations` : null,
      pro.stats.avg_stars != null ? `📊 ${pro.stats.avg_stars.toFixed(1)} avg rating` : null,
      `\n🔗 ${profileUrl}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  }

  function handleWriteRec() {
    if (!isLoggedIn) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user?.role === "homeowner") {
      navigate("/home/recommend");
    }
  }

  const bannerStyle = useMemo(() => {
    if (pro?.wallpaper_url) {
      return { background: `url("${pro.wallpaper_url}")`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    return { background: WALLPAPERS[pro?.wallpaper_id ?? 0] ?? WALLPAPERS[0] };
  }, [pro?.wallpaper_url, pro?.wallpaper_id]);

  useEffect(() => {
    if (!handle) return;
    // Fire-and-forget page view tracking; ref=GK-XXX links view to a prospect
    const ref = searchParams.get("ref") ?? undefined;
    trackProPageView(handle, ref).catch(() => {});
    trackProfileView(handle);
  }, [handle, searchParams]);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setPro(null);
    setNotFound(false);
    getProByHandle(handle)
      .then((data) => {
        setPro(data);
        setLoading(false);
        return getKraftsByPro(data.id);
      })
      .then((ks) => {
        setKrafts(ks);
        // Fire impression for every Kraft rendered
        if (handle) {
          ks.forEach((k) => trackKraftImpression(k.id, handle));
        }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [handle]);

  // § 1.2 Gate — called when user clicks Send in the quote modal
  function handleQuoteClick() {
    if (!isLoggedIn) {
      // Capture the draft immediately so the PRO / GK admin can see it even if
      // the visitor abandons signup. Fire-and-forget — don't block the UI.
      createAnonymousLead({
        pro_id: pro!.id,
        job_title: draftTitle || "Quote Request",
        detail: buildDetail(),
      }).catch(() => {});
      draftRef.current = draftText;
      setQuoteFormOpen(false);
      setAuthGateOpen(true);
      return;
    }
    void submitQuote();
  }

  function buildDetail() {
    return [
      draftText || null,
      draftTimeline ? `Timeline: ${draftTimeline}` : null,
    ].filter(Boolean).join("\n");
  }

  // § 1.3 Authenticated submit (runs after signup OR if already logged in)
  async function submitQuote() {
    if (!pro) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createLead({
        pro_id: pro.id,
        job_title: draftTitle || "Quote Request",
        detail: buildDetail(),
        thread_type: "lead",
      });
      setSubmitSuccess(true);
      setDraftTitle("");
      setDraftText("");
      setDraftTimeline(null);
      draftRef.current = "";
      setQuoteFormOpen(false);
      navigate("/home/messages");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title: pro ? `${pro.name} on GigKraft` : "GigKraft Pro Profile",
      text: pro ? `Check out ${pro.name}'s profile on GigKraft` : "Check out this pro on GigKraft",
      url: profileUrl,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
      }
    }
    void navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Box style={{ minHeight: "100vh" }}>

      <Box maw={860} mx="auto" p="md">
        {loading && <Center mt="xl"><Loader /></Center>}
        {notFound && (
          <Alert color="red" title="Pro not found" mt="xl">
            No pro profile found for <strong>@{handle}</strong>.{" "}
            <Link to="/register">Create an account</Link> to join GigKraft.
          </Alert>
        )}

        {pro && (
          <Stack gap="lg">
            {/* ── Hero card — gradient border wrapper ── */}
            <div style={{
              borderRadius: 18,
              padding: 3,
              background: "var(--gk-brand-gradient)",
              boxShadow: "0 12px 48px color-mix(in srgb, var(--gk-accent-primary) 28%, transparent), 0 4px 16px rgba(0,0,0,0.14)",
            }}>
            <Card radius="lg" padding={0} style={{ overflow: "hidden", background: "var(--gk-bg-surface)" }}>
              {/* Wallpaper banner */}
              <div style={{ height: 120, position: "relative", ...bannerStyle }}>
                <Box style={{
                  position: "absolute", top: 8, right: 10,
                  background: "rgba(255,255,255,0.88)", borderRadius: 8, padding: "3px 7px",
                }}>
                  <GkLogo height={22} />
                </Box>
              </div>

              <div style={{ position: "relative", padding: "0 20px 20px" }}>
                {/* Avatar — overlaps banner */}
                <Avatar
                  size={88}
                  src={pro.avatar_url || undefined}
                  color="blue"
                  radius="xl"
                  style={{
                    fontSize: 32,
                    border: "3px solid var(--mantine-color-body)",
                    position: "absolute",
                    top: -44,
                    left: 20,
                  }}
                >
                  {!pro.avatar_url && pro.name[0]?.toUpperCase()}
                </Avatar>

                {/* Name + handle row — right of avatar */}
                <Group
                  justify="space-between"
                  align="center"
                  pt={8}
                  pl={104}        /* clear the 88px avatar + gap */
                  wrap="nowrap"
                >
                  <Stack gap={2}>
                    <Title order={2} style={{ lineHeight: 1.1 }}>{pro.name}</Title>
                    <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                      @{handle}
                    </Text>
                  </Stack>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Recommend" withArrow>
                      <ActionIcon size="sm" variant="subtle" onClick={handleWriteRec}>
                        <IconStars size={16} color="var(--gk-accent-primary)" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Share on WhatsApp" withArrow>
                      <ActionIcon size="sm" variant="subtle" onClick={handleWhatsAppShare}>
                        <IconBrandWhatsapp size={16} color="var(--mantine-color-green-6)" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={copied ? "Copied!" : "Share"} withArrow>
                      <ActionIcon size="sm" variant="subtle" onClick={handleShare}>
                        <IconLink size={16} color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-secondary)"} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                {/* 2-col equal-height cards: Left = Bio + Contact | Right = About */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md" style={{ alignItems: "stretch" }}>

                  {/* LEFT card — Bio + Contact */}
                  <Card withBorder radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="md" style={{ flex: 1 }}>

                      <Stack gap="xs">
                        <Text size="xs" fw={700} tt="uppercase"
                          style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Bio</Text>
                        {pro.bio
                          ? <Text size="sm" style={{ lineHeight: 1.7 }}>{pro.bio}</Text>
                          : <Text size="sm" c="dimmed" fs="italic">No bio added yet.</Text>}
                      </Stack>

                      <Divider style={{ borderColor: "var(--gk-border)" }} />

                      <Stack gap="xs">
                        <Text size="xs" fw={700} tt="uppercase"
                          style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Contact</Text>
                        {isLoggedIn ? (
                          <Stack gap={4}>
                            <Group gap={6}>
                              <IconMail size={14} color="var(--gk-accent-primary)" />
                              <Text size="sm">{pro.email ?? "Contact via GigKraft"}</Text>
                            </Group>
                            <Group gap={6}>
                              <IconMessage size={14} color="var(--gk-accent-primary)" />
                              <Text size="sm">{pro.phone ?? "—"}</Text>
                            </Group>
                          </Stack>
                        ) : (
                          <Stack gap="xs">
                            <Box style={{ position: "relative", userSelect: "none" }}>
                              <Stack gap={4} style={{ filter: "blur(5px)", pointerEvents: "none" }} aria-hidden>
                                <Group gap={6}><IconMail size={14} /><Text size="sm">john.doe@example.com</Text></Group>
                                <Group gap={6}><IconMessage size={14} /><Text size="sm">+1 (512) 555-0192</Text></Group>
                              </Stack>
                            </Box>
                            {googleError && <Text size="xs" c="red">{googleError}</Text>}
                            <GoogleSignInButton
                              label="signup_with"
                              fullWidth
                              onSuccess={(idToken) =>
                                loginWithGoogle(idToken, "homeowner").then(() =>
                                  navigate(window.location.pathname, { replace: true })
                                )
                              }
                              onError={setGoogleError}
                            />
                            <Text size="xs" c="dimmed" ta="center">
                              Already have an account?{" "}
                              <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>
                                Sign in
                              </Link>
                            </Text>
                          </Stack>
                        )}
                      </Stack>

                    </Stack>
                  </Card>

                  {/* RIGHT card — Trade / Response / Skills */}
                  <Card withBorder radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      {pro.primary_trade || (pro.skill_tags ?? []).length > 0 ? (
                        <>
                          <Group justify="space-between" align="center" wrap="nowrap">
                            {pro.primary_trade && (
                              <Text fw={700} size="sm" style={{ color: "var(--gk-accent-primary)" }}>
                                {pro.primary_trade}
                              </Text>
                            )}
                            {pro.response_hours && (
                              <Text size="sm" style={{ color: "var(--gk-accent-secondary)", flexShrink: 0 }}>
                                ⚡ {pro.response_hours}h response
                              </Text>
                            )}
                          </Group>
                          {((pro.skill_tags ?? []).length > 0 || pro.licensed || pro.insured) && (
                            <>
                              <Divider style={{ borderColor: "var(--gk-border)" }} />
                              <Stack gap={2}>
                                {(pro.skill_tags ?? []).map((s) => (
                                  <Text key={s} size="sm">{s}</Text>
                                ))}
                                {pro.licensed && (
                                  <Text size="sm" c="dimmed">
                                    Licensed{pro.license_number ? ` · ${pro.license_number}` : ""}
                                  </Text>
                                )}
                                {pro.insured && <Text size="sm" c="dimmed">Insured</Text>}
                              </Stack>
                            </>
                          )}
                        </>
                      ) : (
                        <Text size="xs" c="dimmed" fs="italic">No trade info available.</Text>
                      )}
                    </Stack>
                  </Card>

                </SimpleGrid>

                <Divider my="md" />

                {/* Service area + compact map */}
                <Stack gap="xs">
                  <Group gap={4}>
                    <IconMapPin size={14} color="var(--gk-accent-primary)" />
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      Service area
                    </Text>
                  </Group>
                  <Group gap="xs">
                    {pro.service_zips?.length > 0
                      ? pro.service_zips.map((z) => <Badge key={z} variant="outline" size="sm">{z}</Badge>)
                      : pro.service_center_zip
                        ? <Badge variant="outline" size="sm">{pro.service_center_zip} · {pro.service_radius_miles} mi radius</Badge>
                        : <Text size="xs" c="dimmed">Not specified</Text>}
                  </Group>
                </Stack>

                <Divider my="md" />

              </div>
            </Card>
            </div>

            {/* success banner replaces floating button after send */}
            {submitSuccess && (
              <Alert color="green" variant="light" title="Request sent!">
                Your quote request was delivered. Check your{" "}
                <Link to="/home/messages">Messages</Link> for the conversation.
              </Alert>
            )}

            {/* Krafts */}
            {krafts.length > 0 && (
              <Stack gap="sm">
                <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Krafts</Title>
                <Stack gap="md">
                  {krafts.map((k) => (
                    <div key={k.id} onClick={() => handle && trackKraftClick(k.id, handle)}>
                      <KraftCard
                        title={k.title}
                        skill={k.skill}
                        gigType={k.gig_type}
                        description={k.description}
                        location={k.location}
                        startMonth={k.start_month}
                        startYear={k.start_year}
                        endMonth={k.end_month}
                        endYear={k.end_year}
                        beforeUrl={k.before_url}
                        afterUrl={k.after_url}
                      />
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Recommendations */}
            <ReviewsSection handle={handle} />

            {/* CTA if logged out */}
            {!isLoggedIn && (
              <Card withBorder radius="md" padding="lg" style={{ background: "var(--gk-brand-gradient)" }}>
                <Stack align="center" gap="sm">
                  <Text fw={700} size="lg" c="white">Want to hire {pro.name}?</Text>
                  <Text size="sm" c="white" opacity={0.85}>
                    Create a free account to message, request a quote, and see contact info.
                  </Text>
                  <Box w="100%" maw={400}>
                    <GoogleSignInButton
                      label="signup_with"
                      fullWidth
                      onSuccess={(idToken) =>
                        loginWithGoogle(idToken, "homeowner").then(() =>
                          navigate(window.location.pathname, { replace: true })
                        )
                      }
                      onError={setGoogleError}
                    />
                  </Box>
                  <Group gap="sm">
                    <Button component={Link} to="/register" color="white" variant="white"
                      style={{ color: "var(--gk-accent-primary)" }}>
                      Create account
                    </Button>
                    <Button component={Link} to="/login" variant="outline" color="white">Sign in</Button>
                  </Group>
                </Stack>
              </Card>
            )}
          </Stack>
        )}

        {/* Powered by footer */}
        <Group justify="center" align="center" gap={8} py="xl">
          <GkLogo height={28} />
          <Text size="sm" style={{ color: "#000" }}>Powered by gigKraft.com</Text>
        </Group>
      </Box>

      {/* Floating "Request a Quote" button */}
      {pro && !submitSuccess && (
        <Box style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200 }}>
          <Button
            leftSection={<IconSend size={16} />}
            radius="xl"
            size="md"
            onClick={() => setQuoteFormOpen(true)}
            style={{
              background: "var(--gk-brand-gradient)",
              boxShadow: "0 4px 24px color-mix(in srgb, var(--gk-accent-primary) 45%, transparent)",
            }}
          >
            Request a Quote
          </Button>
        </Box>
      )}

      {/* Quote request form modal */}
      <Modal
        opened={quoteFormOpen}
        onClose={() => setQuoteFormOpen(false)}
        title={<Text fw={700} style={{ color: "var(--gk-accent-primary)" }}>Request a Quote from {pro?.name}</Text>}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="What do you need done?"
            placeholder="e.g. Fix leaky faucet"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.currentTarget.value)}
            size="sm"
          />
          <Textarea
            label="Details"
            placeholder="Location, scope, any other info…"
            value={draftText}
            onChange={(e) => setDraftText(e.currentTarget.value)}
            minRows={3}
            maxRows={6}
            autosize
            size="sm"
          />
          <Select
            label="Timeline"
            placeholder="When do you need it?"
            data={TIMELINE_OPTIONS}
            value={draftTimeline}
            onChange={setDraftTimeline}
            size="sm"
            clearable
          />
          {submitError && <Alert color="red" variant="light">{submitError}</Alert>}
          <Button
            fullWidth
            leftSection={isLoggedIn ? <IconSend size={15} /> : <IconLock size={15} />}
            loading={submitting}
            onClick={handleQuoteClick}
            disabled={!draftTitle.trim()}
            style={{ background: "var(--gk-brand-gradient)" }}
            mt="xs"
          >
            {isLoggedIn ? "Send Quote Request" : "Continue to send"}
          </Button>
          {!isLoggedIn && (
            <Text size="xs" c="dimmed" ta="center">
              Free account — your request will be saved immediately.
            </Text>
          )}
        </Stack>
      </Modal>

      {/* Auth gate — data already captured; signup delivers the confirmed lead */}
      <Modal
        opened={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        title="One last step — create your free account"
        size="sm"
      >
        <Stack gap="sm">
          <Alert variant="light" color="blue" icon={<IconLock size={15} />}>
            Your inquiry is saved and the pro can already see it. Sign up to confirm your identity and continue the conversation.
          </Alert>
          <Text size="sm" c="dimmed">
            Quote request: <strong>{draftTitle || "(no title)"}</strong>
          </Text>
          {googleError && <Text size="xs" c="red">{googleError}</Text>}
          <GoogleSignInButton
            label="signup_with"
            fullWidth
            onSuccess={async (idToken) => {
              await loginWithGoogle(idToken, "homeowner");
              setAuthGateOpen(false);
              // § 1.3 Post-Signup Execution — deliver the cached draft
              await submitQuote();
            }}
            onError={setGoogleError}
          />
          <Divider label="or" labelPosition="center" />
          <Button
            variant="light"
            fullWidth
            component={Link}
            to={`/register?next=${encodeURIComponent(window.location.pathname)}`}
          >
            Create account with email
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Already have an account?{" "}
            <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>Sign in</Link>
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}
