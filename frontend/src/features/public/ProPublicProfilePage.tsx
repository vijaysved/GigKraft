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
  IconDownload,
  IconExternalLink,
  IconLink,
  IconLock,
  IconMail,
  IconMapPin,
  IconMessage,
  IconSend,
  IconStars,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { claimAnonymousLead, createAnonymousLead, createLead, getKraftsByPro, getProByHandle, trackKraftClick, trackKraftImpression, trackProfileView, trackProPageView, trackSitePageView, type KraftPublicOut, type ProOut } from "../../api/endpoints";
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
  // Anonymous lead tracking: id set on success, error surfaced in auth gate
  const [anonLeadId, setAnonLeadId] = useState<number | null>(null);
  const [anonLeadLoading, setAnonLeadLoading] = useState(false);
  const [anonLeadError, setAnonLeadError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const profileContentRef = useRef<HTMLDivElement>(null);
  const headerUrlRef = useRef<HTMLSpanElement>(null);
  const footerUrlRef = useRef<HTMLSpanElement>(null);
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

    document.title = `${pro.name} · gigKraft.com`;
    setMeta("og:title", `${pro.name} on gigKraft.com`);
    setMeta("og:description", desc || "Verified pro on gigKraft.com");
    setMeta("og:url", profileUrl);
    setMeta("og:type", "profile");
    if (pro.avatar_url) setMeta("og:image", pro.avatar_url);

    return () => { document.title = "gigKraft.com"; };
  }, [pro, profileUrl]);

  function handleWhatsAppShare() {
    if (!pro) return;
    const lines = [
      `👷 *${pro.name}* on gigKraft.com`,
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
    // Site-config traffic tracking (server-side filters out authenticated admins)
    trackSitePageView(window.location.href);
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
  async function handleQuoteClick() {
    if (!isLoggedIn) {
      draftRef.current = draftText;
      setQuoteFormOpen(false);
      setAuthGateOpen(true);
      setAnonLeadId(null);
      setAnonLeadError(null);
      setAnonLeadLoading(true);
      try {
        const result = await createAnonymousLead({
          pro_id: pro!.id,
          job_title: draftTitle || "Quote Request",
          detail: buildDetail(),
        });
        setAnonLeadId(result.id);
      } catch (e) {
        setAnonLeadError(e instanceof Error ? e.message : "Could not reach server.");
      } finally {
        setAnonLeadLoading(false);
      }
      return;
    }
    void submitQuote();
  }

  // Store pending lead in sessionStorage so the RegisterPage can claim it after email signup.
  function persistPendingLead(overrideAnonId?: number | null) {
    const id = overrideAnonId !== undefined ? overrideAnonId : anonLeadId;
    sessionStorage.setItem("gk_pending_lead", JSON.stringify({
      anon_lead_id: id,
      pro_id: pro!.id,
      job_title: draftTitle || "Quote Request",
      detail: buildDetail(),
    }));
  }

  function buildDetail() {
    return [
      draftText || null,
      draftTimeline ? `Timeline: ${draftTimeline}` : null,
    ].filter(Boolean).join("\n");
  }

  // § 1.3 Authenticated submit — fallback when anonymous lead creation failed or user was already logged in.
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
      sessionStorage.removeItem("gk_pending_lead");
      setSubmitSuccess(true);
      setDraftTitle("");
      setDraftText("");
      setDraftTimeline(null);
      draftRef.current = "";
      setQuoteFormOpen(false);
      navigate("/home/messages?tab=sent");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  }

  // § 1.4 Claim the anonymous lead after authentication (Google or email path).
  // Falls back to submitQuote() if the anon lead never made it to the server.
  async function claimOrSubmit() {
    if (anonLeadId) {
      try {
        await claimAnonymousLead(anonLeadId);
        sessionStorage.removeItem("gk_pending_lead");
        setSubmitSuccess(true);
        setDraftTitle("");
        setDraftText("");
        setDraftTimeline(null);
        draftRef.current = "";
        navigate("/home/messages?tab=sent");
        return;
      } catch {
        // anon lead gone or already claimed — fall through
      }
    }
    await submitQuote();
  }

  function handleShare() {
    setShareOpen(true);
  }

  function copyProfileLink() {
    void navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function exportToPDF() {
    if (exporting) return;
    setExporting(true);
    setPdfGenerating(true);
    // Wait two animation frames so React re-renders PDF-only elements before capture
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => { requestAnimationFrame(() => resolve()); })
    );
    try {
      const el = profileContentRef.current;
      if (!el) throw new Error("Profile content not found.");
      const pixelRatio = 2;
      const canvas = await toCanvas(el, {
        backgroundColor: "#ffffff",
        pixelRatio,
        filter: (node) =>
          !(node instanceof HTMLElement && (
            node.tagName === "BUTTON" ||
            node.tagName === "A" ||
            node.getAttribute("role") === "button"
          )),
      });
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      const margin = 24;
      const usableW = pdfW - margin * 2;
      const ratio = usableW / canvas.width;
      const totalPdfH = canvas.height * ratio;
      const pageH = pdfH - margin * 2;
      if (totalPdfH <= pageH) {
        doc.addImage(canvas, "JPEG", margin, margin, usableW, totalPdfH);
      } else {
        const pages = Math.ceil(totalPdfH / pageH);
        for (let i = 0; i < pages; i++) {
          if (i > 0) doc.addPage();
          const srcY = Math.floor((i * pageH) / ratio);
          const srcH = Math.min(Math.ceil(pageH / ratio), canvas.height - srcY);
          const tmp = document.createElement("canvas");
          tmp.width = canvas.width;
          tmp.height = srcH;
          tmp.getContext("2d")!.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          doc.addImage(tmp, "JPEG", margin, margin, usableW, srcH * ratio);
        }
      }

      // Overlay invisible clickable link annotations on both URL spans
      const elRect = el.getBoundingClientRect();
      function addLinkAnnotation(spanEl: HTMLSpanElement | null) {
        if (!spanEl) return;
        const r = spanEl.getBoundingClientRect();
        const relX = r.left - elRect.left;
        const relY = r.top  - elRect.top;
        const pdfX = margin + relX * pixelRatio * ratio;
        const pdfLinkW = r.width  * pixelRatio * ratio;
        const pdfLinkH = r.height * pixelRatio * ratio;
        // Determine which PDF page the element falls on
        const pdfYfromTop = relY * pixelRatio * ratio;
        const page = Math.floor(pdfYfromTop / pageH);
        const pdfY  = margin + pdfYfromTop - page * pageH;
        doc.setPage(page + 1);
        doc.link(pdfX, pdfY, pdfLinkW, pdfLinkH, { url: profileUrl });
      }
      addLinkAnnotation(headerUrlRef.current);
      addLinkAnnotation(footerUrlRef.current);

      const safeName  = (pro?.name          ?? "pro").replace(/\s+/g, "-").toLowerCase();
      const safeTrade = (pro?.primary_trade ?? "profile").replace(/\s+/g, "-").toLowerCase();
      doc.save(`${safeName}-${safeTrade}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setPdfGenerating(false);
      setExporting(false);
    }
  }

  return (
    <Box style={{ minHeight: "100vh" }}>

      <Box maw={860} mx="auto" p="md">
        {loading && <Center mt="xl"><Loader /></Center>}
        {notFound && (
          <Alert color="red" title="Pro not found" mt="xl">
            No pro profile found for <strong>@{handle}</strong>.{" "}
            <Link to="/register">Create an account</Link> to join gigKraft.com.
          </Alert>
        )}

        {pro && (
          <div ref={profileContentRef}>
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
                  {pdfGenerating ? (
                    <span
                      ref={headerUrlRef}
                      style={{
                        fontFamily: "var(--mantine-font-family-monospace)",
                        color: "var(--gk-accent-primary)",
                        fontSize: "var(--mantine-font-size-xs)",
                        flexShrink: 0,
                      }}
                    >
                      {profileUrl}
                    </span>
                  ) : (
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label="Recommend" withArrow>
                        <ActionIcon size="sm" variant="subtle" onClick={handleWriteRec}>
                          <IconStars size={16} color="var(--gk-accent-primary)" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Share" withArrow>
                        <ActionIcon size="sm" variant="subtle" onClick={handleShare}>
                          <IconLink size={16} color="var(--gk-accent-secondary)" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Download PDF" withArrow>
                        <ActionIcon size="sm" variant="subtle" loading={exporting} onClick={() => void exportToPDF()}>
                          <IconDownload size={16} color="var(--gk-accent-secondary)" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
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
                              <Text size="sm">{pro.email ?? "Contact via gigKraft.com"}</Text>
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

            {/* PDF-only footer: avatar + URL + powered-by logo */}
            {pdfGenerating && (
              <Box
                pt="lg"
                mt="sm"
                style={{ borderTop: "2px solid var(--gk-border)" }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="md" align="center">
                    <Avatar
                      size={52}
                      src={pro.avatar_url || undefined}
                      color="blue"
                      radius="xl"
                      style={{ border: "2px solid var(--gk-border)", flexShrink: 0 }}
                    >
                      {!pro.avatar_url && pro.name[0]?.toUpperCase()}
                    </Avatar>
                    <Stack gap={2}>
                      <Text fw={700} size="sm">{pro.name}</Text>
                      <span
                        ref={footerUrlRef}
                        style={{
                          fontFamily: "var(--mantine-font-family-monospace)",
                          color: "var(--gk-accent-primary)",
                          fontSize: "var(--mantine-font-size-xs)",
                        }}
                      >
                        {profileUrl}
                      </span>
                    </Stack>
                  </Group>
                  <Stack align="flex-end" gap={4}>
                    <GkLogo height={28} />
                    <Text size="xs" c="dimmed" fw={500}>Powered by gigKraft.com</Text>
                  </Stack>
                </Group>
              </Box>
            )}
          </Stack>
          </div>
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
            onClick={() => void handleQuoteClick()}
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

      {/* Auth gate — data already captured; signup claims the lead */}
      <Modal
        opened={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        title="One last step — create your free account"
        size="sm"
      >
        <Stack gap="sm">
          {anonLeadLoading ? (
            <Alert variant="light" color="blue" icon={<IconLock size={15} />}>
              Saving your inquiry…
            </Alert>
          ) : anonLeadError ? (
            <Alert variant="light" color="orange" icon={<IconLock size={15} />}>
              We couldn't reach the server to save your inquiry. Don't worry — it will be delivered once you sign up.
            </Alert>
          ) : (
            <Alert variant="light" color="blue" icon={<IconLock size={15} />}>
              Your inquiry is saved and the pro can already see it. Sign up to confirm your identity and continue the conversation.
            </Alert>
          )}
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
              // § 1.4 Claim the anon lead (or create a new one if anon creation failed)
              await claimOrSubmit();
            }}
            onError={setGoogleError}
          />
          <Divider label="or" labelPosition="center" />
          <Button
            variant="light"
            fullWidth
            onClick={() => {
              persistPendingLead();
              navigate(`/register?next=${encodeURIComponent(window.location.pathname)}`);
            }}
          >
            Create account with email
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Already have an account?{" "}
            <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>Sign in</Link>
          </Text>
        </Stack>
      </Modal>

      {/* ── Share card modal ── */}
      {pro && (
        <Modal
          opened={shareOpen}
          onClose={() => setShareOpen(false)}
          title={<Text fw={700} size="sm">Share Profile</Text>}
          size="sm"
          centered
        >
          {/* Profile card */}
          <Box
            style={{
              borderRadius: 14,
              padding: 2,
              background: "var(--gk-brand-gradient)",
              boxShadow: "0 4px 24px color-mix(in srgb, var(--gk-accent-primary) 20%, transparent)",
            }}
          >
            <Box style={{ borderRadius: 12, background: "var(--gk-bg-surface)", padding: "20px" }}>
              <Group gap="md" wrap="nowrap" align="flex-start">
                <Avatar
                  size={72}
                  src={pro.avatar_url || undefined}
                  color="blue"
                  radius="xl"
                  style={{ flexShrink: 0, border: "2px solid var(--gk-border)" }}
                >
                  {!pro.avatar_url && pro.name[0]?.toUpperCase()}
                </Avatar>
                <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={700} size="lg" style={{ lineHeight: 1.2 }}>{pro.name}</Text>
                  {pro.primary_trade && (
                    <Text size="sm" fw={600} style={{ color: "var(--gk-accent-primary)" }}>
                      {pro.primary_trade}
                    </Text>
                  )}
                  {pro.response_hours && (
                    <Text size="xs" style={{ color: "var(--gk-accent-secondary)" }}>
                      ⚡ {pro.response_hours}h response
                    </Text>
                  )}
                  {pro.bio && (
                    <Text size="xs" c="dimmed" lineClamp={1} style={{ lineHeight: 1.5 }}>
                      {pro.bio}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Box>
          </Box>

          {/* URL row */}
          <Group gap="xs" mt="md" wrap="nowrap">
            <Text size="xs" c="dimmed" truncate style={{ flex: 1, fontFamily: "var(--mantine-font-family-monospace)" }}>
              {profileUrl}
            </Text>
            <Tooltip label={copied ? "Copied!" : "Copy link"} withArrow>
              <ActionIcon size="sm" variant="light" color={copied ? "green" : "gray"} onClick={copyProfileLink}>
                <IconLink size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Open profile" withArrow>
              <ActionIcon size="sm" variant="light" color="gray" component="a" href={profileUrl} target="_blank" rel="noopener noreferrer">
                <IconExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider my="md" />

          {/* Action buttons */}
          <Stack gap="xs">
            <Button
              fullWidth
              leftSection={<IconBrandWhatsapp size={16} />}
              color="green"
              variant="light"
              onClick={() => { setShareOpen(false); handleWhatsAppShare(); }}
            >
              Share on WhatsApp
            </Button>
            <Button
              fullWidth
              leftSection={<IconDownload size={16} />}
              variant="light"
              loading={exporting}
              onClick={() => { setShareOpen(false); void exportToPDF(); }}
            >
              Download PDF
            </Button>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}
