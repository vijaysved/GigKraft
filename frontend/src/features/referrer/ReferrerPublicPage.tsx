import {
  Alert,
  Avatar,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconBriefcase,
  IconCheck,
  IconLink,
  IconMail,
  IconPhone,
  IconPlus,
  IconSearch,
  IconSend,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { getReferrerMe } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { getAccessToken } from "../../api/tokens";
import { fallbackAvatar } from "../../assets/fallbackAvatars";
import type { ReferrerPublicOut } from "./types";
import { AddProByContactModal } from "./components/AddProByContactModal";
import { AddProModal } from "./components/AddProModal";
import { FollowModal } from "./components/FollowModal";
import { ReferrerProCard } from "./components/ReferrerProCard";
import { RequestReferralModal } from "./components/RequestReferralModal";
import { formatPhone } from "../../utils/format";
import { toCamelTag } from "../../utils/tags";
import { useFavorites } from "../../hooks/useFavorites";
import { TAG_FILTER_COLOR } from "../../theme/tagColor";

const GK_LOGO_URL = "https://gigkraft.com/brand/gigKraftLogo.png";

const iconColor = { color: "var(--gk-accent-primary)" } satisfies React.CSSProperties;

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  padding: "8px 16px",
  border: "none",
  borderRadius: 99,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "inherit",
  lineHeight: 1.5,
  transition: "opacity 0.15s ease",
};

const followBtn: React.CSSProperties = {
  ...btnBase,
  background: "var(--gk-brand-gradient)",
  color: "#fff",
  boxShadow: "0 3px 10px -2px var(--gk-accent-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
};

const requestBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--gk-accent-primary)",
  border: "1.5px solid var(--gk-accent-primary)",
};


/** Round icon-only action button */
function IconAction({
  label,
  onClick,
  children,
  color,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Tooltip label={label} withArrow position="bottom">
      <button
        onClick={onClick}
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          border: "1.5px solid var(--gk-border)",
          borderRadius: "50%",
          background: "transparent",
          cursor: "pointer",
          color: color ?? "var(--gk-accent-primary)",
          fontFamily: "inherit",
          transition: "background 0.15s, border-color 0.15s",
          flexShrink: 0,
        }}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function EmptyProCard() {
  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        borderStyle: "dashed",
        borderColor: "var(--mantine-color-gray-3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap" mb={8}>
        <Skeleton radius="sm" width={80} height={80} style={{ flexShrink: 0 }} />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton height={12} width="65%" radius="xl" />
          <Skeleton height={10} width="45%" radius="xl" />
          <Skeleton height={10} width="55%" radius="xl" mt={4} />
          <Skeleton height={10} width="40%" radius="xl" />
        </Stack>
      </Group>
      <Skeleton height={10} width="75%" radius="xl" mb={6} />
      <Group gap={6}>
        <Skeleton height={18} width={64} radius="xl" />
        <Skeleton height={18} width={56} radius="xl" />
      </Group>
    </Card>
  );
}

const BANNER_DISMISS_KEY = "gk_banner_dismissed";

export function ReferrerPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = status === "authenticated";
  const { favIds, toggle: toggleFavorite } = useFavorites();

  const claimToken = searchParams.get("claim") ?? "";
  const invToken = searchParams.get("inv") ?? "";

  const [page, setPage] = useState<ReferrerPublicOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [addProOpen, setAddProOpen] = useState(false);
  const [addProByContactOpen, setAddProByContactOpen] = useState(false);
  const [followerState, setFollowerState] = useState<{ follower_id: number; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [selectedZips, setSelectedZips] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [highlightedProId, setHighlightedProId] = useState<number | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(BANNER_DISMISS_KEY) === "1"
  );

  const uniqueTrades = useMemo(() => {
    if (!page?.pros) return [] as string[];
    return [...new Set(page.pros.map((p) => p.trade).filter(Boolean))].sort();
  }, [page]);

  const uniqueZips = useMemo(() => {
    if (!page?.pros) return [] as string[];
    return [...new Set(page.pros.map((p) => p.city).filter(Boolean))].sort();
  }, [page]);

  const uniqueTags = useMemo(() => {
    if (!page?.pros) return [] as string[];
    return [...new Set(page.pros.flatMap((p) => p.tags ?? []))].sort();
  }, [page]);

  function toggleTrade(t: string) {
    setSelectedTrades((prev) => { const n = new Set(prev); if (n.has(t)) { n.delete(t); } else { n.add(t); } return n; });
  }
  function toggleZip(z: string) {
    setSelectedZips((prev) => { const n = new Set(prev); if (n.has(z)) { n.delete(z); } else { n.add(z); } return n; });
  }
  function toggleTag(t: string) {
    setSelectedTags((prev) => { const n = new Set(prev); if (n.has(t)) { n.delete(t); } else { n.add(t); } return n; });
  }

  const filteredPros = useMemo(() => {
    if (!page?.pros) return [];
    const q = search.toLowerCase().trim();
    return page.pros.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.trade?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.endorsement?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (selectedTrades.size > 0 && !selectedTrades.has(p.trade)) return false;
      if (selectedZips.size > 0 && !selectedZips.has(p.city)) return false;
      if (selectedTags.size > 0 && !p.tags?.some((t) => selectedTags.has(t))) return false;
      return true;
    });
  }, [search, page, selectedTrades, selectedZips, selectedTags]);

  async function load() {
    setLoading(true);
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const r = await fetch(`${API_BASE_URL}/api/referrer/${slug}`, { headers });
      if (!r.ok) throw new Error("Not found");
      const data = await r.json() as ReferrerPublicOut;
      setPage(data);
      setFollowerState(data.follower_state);
    } catch {
      setError("This page could not be found.");
    } finally {
      setLoading(false);
    }
  }

  // Detect ownership by comparing the authenticated user's slug with the URL slug
  useEffect(() => {
    if (!isAuthenticated) { setIsOwner(false); return; }
    getReferrerMe()
      .then((data) => { setIsOwner(!!data?.profile?.slug && data.profile.slug === slug); })
      .catch(() => setIsOwner(false));
  }, [isAuthenticated, slug]);

  useEffect(() => { load(); }, [slug, status]);

  // Fire click counts and resolve highlighted pro card on mount
  useEffect(() => {
    if (claimToken) {
      // Fire-and-forget click increment
      fetch(`${API_BASE_URL}/api/referrer/pro-invite/click/${claimToken}`, { method: "POST" });
      // Preview to know which card to highlight
      fetch(`${API_BASE_URL}/api/referrer/pro-invite/preview/${claimToken}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data: { pro_id?: number } | null) => {
          if (data?.pro_id) setHighlightedProId(data.pro_id);
        })
        .catch(() => undefined);
    }
    if (invToken) {
      fetch(`${API_BASE_URL}/api/referrer/friend-invite/click/${invToken}`, { method: "POST" });
    }
  }, [claimToken, invToken]);

  useEffect(() => {
    if (page) {
      document.title = `${page.display_name}'s Trusted Pros · gigKraft.com`;
      return () => { document.title = "gigKraft.com"; };
    }
  }, [page?.display_name]);

  // Inject OG meta tags so WhatsApp / social link preview picks up the profile pic
  useEffect(() => {
    if (!page) return;

    const imageUrl = page.avatar_url || GK_LOGO_URL;
    const title = `${page.display_name}'s Trusted Pros · GigKraft`;
    const description =
      page.bio ||
      `Trusted home service professionals curated by ${page.display_name} on GigKraft.`;
    const url = `https://gigkraft.com/us/${slug}/refer`;

    function upsertMeta(attr: string, val: string, content: string): Element {
      const sel = `meta[${attr}="${val}"]`;
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    }

    const injected = [
      upsertMeta("property", "og:title", title),
      upsertMeta("property", "og:description", description),
      upsertMeta("property", "og:image", imageUrl),
      upsertMeta("property", "og:url", url),
      upsertMeta("property", "og:type", "profile"),
      upsertMeta("name", "twitter:card", "summary_large_image"),
      upsertMeta("name", "twitter:image", imageUrl),
      upsertMeta("name", "twitter:title", title),
      upsertMeta("name", "twitter:description", description),
    ];

    return () => { injected.forEach((el) => el.remove()); };
  }, [page, slug]);

  if (loading) return <Center h="100vh"><Loader /></Center>;

  if (error || !page) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text fw={600}>Page not found</Text>
          <Text c="dimmed" size="sm">This referrer page may not exist.</Text>
        </Stack>
      </Center>
    );
  }

  const isFollower = !!followerState;
  const avatarSrc = page.avatar_url || fallbackAvatar(page.slug);
  // Short, click-tracked link (/r/<code>) — redirects to the canonical /us/:slug/refer
  // URL, which the bot-only Vercel rewrite still routes to the backend for OG tags.
  const shareUrl = page.short_url;

  function handleCopyUrl() {
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function openWhatsAppShare() {
    const lines: string[] = [
      `👋 Check out *${page!.display_name}'s Trusted Pros* on GigKraft!`,
    ];
    if (page!.bio) lines.push(`_"${page!.bio}"_`);
    lines.push("");
    if (isOwner && page!.phone) lines.push(`📞 ${formatPhone(page!.phone)}`);
    if (isOwner && page!.email) lines.push(`✉️ ${page!.email}`);
    lines.push(
      `👥 ${page!.follower_count} follower${page!.follower_count !== 1 ? "s" : ""}`,
      `📋 ${page!.referral_count} referral${page!.referral_count !== 1 ? "s" : ""} sent`,
    );
    lines.push("", `🔗 ${shareUrl}`);

    const msg = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  function dismissBanner() {
    localStorage.setItem(BANNER_DISMISS_KEY, "1");
    setBannerDismissed(true);
  }

  return (
    <>
      {/* Visitor signup banner — only for non-authenticated, non-dismissed visitors */}
      {!isAuthenticated && !bannerDismissed && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "var(--gk-brand-gradient, linear-gradient(135deg,#C42200,#FF6B1A 55%,#84CC16))",
            color: "#fff",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              You're viewing {page?.display_name ?? "this"}'s trusted circle of local pros.
            </span>
            <span style={{ fontSize: 13, marginLeft: 8, opacity: 0.9 }}>
              Sign up free to follow their recommendations.
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "#fff",
                color: "var(--gk-accent-primary, #C42200)",
                border: "none",
                borderRadius: 99,
                padding: "5px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.6)",
                borderRadius: 99,
                padding: "5px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Log In
            </button>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss"
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: "0 4px",
                fontFamily: "inherit",
                opacity: 0.8,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Group
        align="flex-start"
        gap="xl"
        p="xl"
        maw={1100}
        mx="auto"
        py={48}
        wrap="wrap"
      >
        {/* ── Left: Profile card ── */}
        <Card
          withBorder
          radius="md"
          p="md"
          style={{
            width: 240,
            flexShrink: 0,
            position: "sticky",
            top: 24,
            borderColor: "var(--gk-border)",
            boxShadow: "0 4px 14px -4px var(--gk-accent-secondary)",
          }}
        >
          {/* Avatar — always visible */}
          <Stack align="center" gap="xs" mb="sm">
            <Avatar
              src={avatarSrc}
              size={96}
              radius="50%"
              color="teal"
              style={{ border: "2px solid var(--gk-accent-primary)" }}
            >
              {page.display_name?.[0]?.toUpperCase()}
            </Avatar>

            <Title order={5} ta="center" style={{ wordBreak: "break-word" }}>
              {page.display_name}
            </Title>

            {page.bio && (
              <Text size="xs" fs="italic" c="dimmed" ta="center" lineClamp={3}>
                {page.bio}
              </Text>
            )}

            {/* Contact rows — any logged-in user */}
            {isAuthenticated && (
              <Stack gap={4} w="100%">
                <Group gap={6}>
                  <IconPhone size={12} style={iconColor} />
                  <Text size="xs">{page.phone ? formatPhone(page.phone) : "—"}</Text>
                </Group>
                <Group gap={6}>
                  <IconMail size={12} style={iconColor} />
                  <Text size="xs">{page.email || "—"}</Text>
                </Group>
              </Stack>
            )}
          </Stack>

          <Divider mb="sm" style={{ borderColor: "var(--gk-border)" }} />

          {/* Stats */}
          <SimpleGrid cols={3} spacing={6} mb="sm">
            {(
              [
                { icon: <IconUsers size={22} />, count: page.follower_count, label: "Followers", color: "var(--mantine-color-red-6)" },
                { icon: <IconSend size={22} />, count: page.referral_count, label: "Referrals", color: "var(--mantine-color-blue-6)" },
                { icon: <IconBriefcase size={22} />, count: page.pros.length, label: "Pros", color: "var(--mantine-color-green-6)" },
              ] as const
            ).map(({ icon, count, label, color }) => (
              <Stack
                key={label}
                align="center"
                gap={2}
                p={8}
                style={{
                  background: "var(--mantine-color-default)",
                  borderRadius: 10,
                  border: `1.5px solid ${color}`,
                }}
              >
                <Center style={{ color }}>{icon}</Center>
                {count > 0 && (
                  <Text size="sm" fw={700} lh={1} style={{ color }}>
                    {count}
                  </Text>
                )}
                <Text size="10px" c="dimmed" fw={500} ta="center" lh={1.2}>
                  {label}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>

          {/* Share icons — visible to all */}
          <Group gap={8} justify="center" mb="sm">
            <IconAction label="Share on WhatsApp" onClick={openWhatsAppShare} color="#25D366">
              <IconBrandWhatsapp size={18} />
            </IconAction>
            <IconAction
              label={copied ? "Copied!" : "Copy page link"}
              onClick={handleCopyUrl}
              color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-primary)"}
            >
              {copied ? <IconCheck size={18} /> : <IconLink size={18} />}
            </IconAction>
          </Group>

          {/* Visitor: follow / request actions */}
          {!isOwner && (
            <Stack gap="xs">
              {!isFollower ? (
                <button style={followBtn} onClick={() => setFollowOpen(true)}>
                  <IconUserCheck size={15} color="#fff" />
                  Follow
                </button>
              ) : (
                <Alert color="teal" variant="light" py={6} px={10}>
                  <Text size="xs">Following as {followerState!.name}</Text>
                </Alert>
              )}
              {isFollower && (
                <button style={requestBtn} onClick={() => setRequestOpen(true)}>
                  <IconSend size={14} />
                  Request a referral
                </button>
              )}
            </Stack>
          )}

          <Text ta="center" size="xs" c="dimmed" mt="sm">
            Powered by{" "}
            <a href="https://gigkraft.com" style={{ color: "inherit" }}>
              gigKraft.com
            </a>
          </Text>
        </Card>

        {/* ── Right: Search + pros grid ── */}
        <Stack gap="md" style={{ flex: 1, minWidth: 280 }}>
          <Group gap="sm" align="center">
            <TextInput
              style={{ flex: 1 }}
              placeholder="Search by name, phone, email, trade, zip…"
              leftSection={<IconSearch size={15} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="xl"
            />
            {isOwner && (
              <button
                onClick={() => setAddProByContactOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "var(--gk-brand-gradient)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 3px 10px -2px var(--gk-accent-primary)",
                  flexShrink: 0,
                }}
              >
                <IconPlus size={14} color="#fff" />
                Add a Pro
              </button>
            )}
          </Group>

          {(uniqueTrades.length > 0 || uniqueZips.length > 0 || uniqueTags.length > 0) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {uniqueTrades.map((t) => {
                const active = selectedTrades.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTrade(t)}
                    style={{
                      padding: "3px 11px",
                      borderRadius: 99,
                      border: "1.5px solid var(--gk-accent-primary)",
                      background: active ? "var(--gk-accent-primary)" : "transparent",
                      color: active ? "var(--gk-accent-secondary)" : "var(--gk-accent-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
              {uniqueZips.map((z) => {
                const active = selectedZips.has(z);
                return (
                  <button
                    key={z}
                    onClick={() => toggleZip(z)}
                    style={{
                      padding: "3px 11px",
                      borderRadius: 99,
                      border: "1.5px solid var(--gk-accent-primary)",
                      background: active ? "var(--gk-accent-primary)" : "transparent",
                      color: active ? "var(--gk-accent-secondary)" : "var(--gk-accent-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {z}
                  </button>
                );
              })}
              {uniqueTags.map((tag) => {
                const active = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "3px 11px",
                      borderRadius: 99,
                      border: `1.5px solid ${TAG_FILTER_COLOR}`,
                      background: active ? TAG_FILTER_COLOR : "transparent",
                      color: active ? "#fff" : TAG_FILTER_COLOR,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    #{toCamelTag(tag)}
                  </button>
                );
              })}
            </div>
          )}

          {!page.pros?.length ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <EmptyProCard />
              <EmptyProCard />
            </SimpleGrid>
          ) : filteredPros.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No pros match the current filters.
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {filteredPros.map((pro) => (
                <ReferrerProCard
                  key={pro.id}
                  pro={pro}
                  slug={slug!}
                  referrerName={page.display_name}
                  allPros={page.pros ?? []}
                  isFollower={isFollower}
                  isAuthenticated={isAuthenticated}
                  isOwner={isOwner}
                  onNeedFollow={() => setFollowOpen(true)}
                  highlightedProId={highlightedProId ?? undefined}
                  claimToken={claimToken || undefined}
                  onTagClick={toggleTag}
                  favorite={pro.linked_pro_id != null ? {
                    isFavorited: favIds.has(pro.linked_pro_id),
                    onToggle: () => toggleFavorite(pro.linked_pro_id!),
                    isAuthenticated,
                  } : undefined}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Group>

      <FollowModal
        opened={followOpen}
        onClose={() => setFollowOpen(false)}
        slug={slug!}
        referrerName={page.display_name}
        onFollowed={(id, name) => setFollowerState({ follower_id: id, name })}
      />

      <RequestReferralModal
        opened={requestOpen}
        onClose={() => setRequestOpen(false)}
        slug={slug!}
        referrerName={page.display_name}
        selectedPro={null}
        pros={page.pros}
        onRequested={load}
      />

      <AddProModal
        opened={addProOpen}
        onClose={() => setAddProOpen(false)}
        onAdded={() => { void load(); }}
      />

      <AddProByContactModal
        opened={addProByContactOpen}
        onClose={() => setAddProByContactOpen(false)}
        onAdded={() => { void load(); }}
      />
    </>
  );
}
