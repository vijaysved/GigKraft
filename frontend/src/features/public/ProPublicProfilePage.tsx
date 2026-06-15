import {
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
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBolt,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCertificate,
  IconLink,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhoto,
  IconShieldCheck,
  IconStar,
  IconStarFilled,
  IconStars,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getKraftsByPro, getProByHandle, type KraftPublicOut, type ProOut } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { KraftCard } from "../../components/KraftCard";
import { ReviewsSection } from "../../components/ReviewsSection";

const WALLPAPERS = [
  "var(--gk-brand-gradient)",
  "linear-gradient(135deg, #0D1B30 0%, #1B3D5C 100%)",
  "linear-gradient(135deg, #7A3D18 0%, #D4713A 100%)",
  "linear-gradient(135deg, #006058 0%, #00A896 100%)",
  "linear-gradient(135deg, #120900 0%, #3D1F00 100%)",
];

// ── Compact ZIP map via Nominatim + OSM embed ─────────────────────────────────
function ZipMap({ zip }: { zip: string }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!zip) return;
    fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&country=US&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((results: { lat: string; lon: string }[]) => {
        if (results[0]) setCoords({ lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) });
      })
      .catch(() => {});
  }, [zip]);

  if (!coords) return null;

  const { lat, lon } = coords;
  const d = 0.06;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d},${lat - d},${lon + d},${lat + d}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <Box style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--gk-border)", height: 140 }}>
      <iframe
        src={src}
        title="Service area map"
        width="100%"
        height="140"
        style={{ border: "none", display: "block" }}
        loading="lazy"
      />
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProPublicProfilePage() {
  const { id: handle } = useParams<{ id: string }>();
  const { status, user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pro, setPro] = useState<ProOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [krafts, setKrafts] = useState<KraftPublicOut[]>([]);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const isLoggedIn = status === "authenticated";
  const profileUrl = window.location.href;
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

  // ZIP to show in map — first explicit zip, or center zip for radial
  const mapZip = useMemo(() => {
    if (!pro) return "";
    if (pro.service_mode === "explicit") return pro.service_zips?.[0] ?? "";
    return pro.service_center_zip ?? "";
  }, [pro]);

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
      .then((ks) => setKrafts(ks))
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [handle]);

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
              <div style={{ height: 120, ...bannerStyle }} />

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
                  <Group gap={6} wrap="nowrap">
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconStars size={13} />}
                      onClick={handleWriteRec}
                      style={{
                        background: "color-mix(in srgb, var(--gk-accent-primary) 12%, transparent)",
                        color: "var(--gk-accent-primary)",
                        border: "1px solid color-mix(in srgb, var(--gk-accent-primary) 25%, transparent)",
                      }}
                    >
                      Recommend
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconBrandWhatsapp size={13} />}
                      onClick={handleWhatsAppShare}
                      title="Share on WhatsApp"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconLink size={13} />}
                      onClick={handleShare}
                      color={copied ? "green" : undefined}
                    >
                      {copied ? "Copied!" : "Share"}
                    </Button>
                  </Group>
                </Group>

                {/* 2-col: Left = Bio + Contact | Right = Pills */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">

                  {/* LEFT — Bio + Contact info */}
                  <Stack gap="sm">
                    {/* Bio below avatar area */}
                    {pro.bio && (
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>{pro.bio}</Text>
                    )}

                    {/* Contact info */}
                    <Stack gap={4}>
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                        Contact info
                      </Text>
                      {isLoggedIn ? (
                        <Stack gap={4}>
                          <Group gap={6}>
                            <IconMail size={14} color="var(--gk-text-muted)" />
                            <Text size="sm">{pro.email ?? "Contact via GigKraft"}</Text>
                          </Group>
                          <Group gap={6}>
                            <IconMessage size={14} color="var(--gk-text-muted)" />
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

                  {/* RIGHT — All pills together */}
                  <Stack gap="sm" pt={{ base: 0, sm: 4 }}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                      About
                    </Text>
                    <Group gap="xs" wrap="wrap">
                      {/* Trade */}
                      {pro.primary_trade && (
                        <Badge variant="light" leftSection={<IconBuildingStore size={12} />}>
                          {pro.primary_trade}
                        </Badge>
                      )}
                      {/* Response time */}
                      <Badge variant="light" color="blue">⚡ {pro.response_hours}h response</Badge>
                      {/* Credentials — only if true */}
                      {pro.licensed && (
                        <Badge color="green" leftSection={<IconCertificate size={12} />} variant="light">
                          Licensed{pro.license_number ? ` · ${pro.license_number}` : ""}
                        </Badge>
                      )}
                      {pro.insured && (
                        <Badge color="teal" leftSection={<IconShieldCheck size={12} />} variant="light">
                          Insured
                        </Badge>
                      )}
                      {/* Skills */}
                      {pro.skill_tags?.map((s: string) => (
                        <Badge key={s} variant="dot" size="sm">{s}</Badge>
                      ))}
                    </Group>
                  </Stack>
                </SimpleGrid>

                <Divider my="md" />

                {/* Service area + compact map */}
                <Stack gap="xs">
                  <Group gap={4}>
                    <IconMapPin size={14} color="var(--gk-text-muted)" />
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
                  {mapZip && <ZipMap zip={mapZip} />}
                </Stack>

                <Divider my="md" />

                {/* Stats */}
                <Group gap="sm" wrap="wrap">
                  <Badge size="lg" variant="light" color="yellow" leftSection={<IconStarFilled size={13} />}>
                    {pro.stats.recs_approved} Reviews
                  </Badge>
                  <Badge size="lg" variant="light" color="blue" leftSection={<IconPhoto size={13} />}>
                    {pro.stats.krafts_verified} Krafts
                  </Badge>
                  {pro.stats.avg_stars != null && (
                    <Badge size="lg" variant="light" color="orange" leftSection={<IconStar size={13} />}>
                      {pro.stats.avg_stars.toFixed(1)} avg rating
                    </Badge>
                  )}
                  <Badge size="lg" variant="light" color="teal" leftSection={<IconBolt size={13} />}>
                    {pro.response_hours}h avg response
                  </Badge>
                </Group>
              </div>
            </Card>
            </div>

            {/* Krafts */}
            {krafts.length > 0 && (
              <Stack gap="sm">
                <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Krafts</Title>
                <Stack gap="md">
                  {krafts.map((k) => (
                    <KraftCard
                      key={k.id}
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
      </Box>
    </Box>
  );
}
