import {
  Alert,
  Avatar,
  Badge,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCheck,
  IconEye,
  IconLink,
  IconMessage,
  IconSearch,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { trackSitePageView } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { useProAvatar } from "../../hooks/useProAvatar";
import { useSetPublicBrandTheme } from "../../theme/PublicBrandThemeContext";
import { brandCssVars } from "../../theme/themes";
import { TAG_FILTER_COLOR } from "../../theme/tagColor";
import { toCamelTag } from "../../utils/tags";
import { CommunityHeader } from "./components/CommunityHeader";
import { CommunityProCard } from "./components/CommunityProCard";
import { JoinCommunityModal } from "./components/JoinCommunityModal";
import { MessageOwnerModal } from "./components/MessageOwnerModal";
import { RequestCommunityProModal } from "./components/RequestCommunityProModal";
import { communityFetch, useCommunityPublic } from "./hooks/useCommunity";
import type { CommunityMemberOut, CommunityProOut } from "./types";

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

const joinBtn: React.CSSProperties = {
  ...btnBase,
  background: "var(--gk-accent-secondary)",
  color: "#fff",
  boxShadow: "0 3px 10px -2px var(--gk-accent-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
};

/** Round icon-only action button — matches ReferrerPublicPage's share icons. */
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

function PublicMembersList({ slug }: { slug: string }) {
  const [members, setMembers] = useState<CommunityMemberOut[]>([]);
  useEffect(() => {
    communityFetch(`/api/communities/${slug}/members`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CommunityMemberOut[]) => setMembers(data))
      .catch(() => setMembers([]));
  }, [slug]);
  if (members.length === 0) return <Text size="sm" c="dimmed">No members yet.</Text>;
  return (
    <Group gap="xs">
      {members.map((m) => (
        <Group key={m.id} gap={6} wrap="nowrap">
          <Avatar size={24} radius="xl" color="teal">{m.name[0]?.toUpperCase()}</Avatar>
          <Text size="sm">{m.name}</Text>
        </Group>
      ))}
    </Group>
  );
}

export function CommunityPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { status, user } = useAuth();
  const isAuthenticated = status === "authenticated";
  const { favIds, toggle: toggleFavorite } = useFavorites();
  const avatarSrc = useProAvatar();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useCommunityPublic(slug);
  useSetPublicBrandTheme(data?.theme);
  const [requestPro, setRequestPro] = useState<CommunityProOut | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [linkCopyCount, setLinkCopyCount] = useState(0);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [messageOwnerOpen, setMessageOwnerOpen] = useState(false);

  const uniqueTrades = useMemo(() => {
    if (!data?.pros) return [] as string[];
    return [...new Set(data.pros.map((p) => p.trade).filter(Boolean))].sort();
  }, [data]);

  const uniqueTags = useMemo(() => {
    if (!data?.pros) return [] as string[];
    return [...new Set(data.pros.flatMap((p) => p.tags ?? []))].sort();
  }, [data]);

  function toggleTrade(t: string) {
    setSelectedTrades((prev) => { const n = new Set(prev); if (n.has(t)) { n.delete(t); } else { n.add(t); } return n; });
  }
  function toggleTag(t: string) {
    setSelectedTags((prev) => { const n = new Set(prev); if (n.has(t)) { n.delete(t); } else { n.add(t); } return n; });
  }

  const filteredPros = useMemo(() => {
    if (!data?.pros) return [];
    const q = search.toLowerCase().trim();
    return data.pros.filter((p) => {
      if (q) {
        const hit =
          p.display_name.toLowerCase().includes(q) ||
          p.trade?.toLowerCase().includes(q) ||
          p.endorsement?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (selectedTrades.size > 0 && !selectedTrades.has(p.trade)) return false;
      if (selectedTags.size > 0 && !p.tags?.some((t) => selectedTags.has(t))) return false;
      return true;
    });
  }, [search, data, selectedTrades, selectedTags]);

  useEffect(() => {
    if (data) {
      document.title = `${data.name} · GigKraft Community`;
      return () => { document.title = "gigKraft.com"; };
    }
  }, [data?.name]);

  useEffect(() => {
    if (slug) trackSitePageView(window.location.href);
  }, [slug]);

  useEffect(() => {
    if (data) setLinkCopyCount(data.link_copy_count);
  }, [data?.link_copy_count]);

  if (loading) return <Center h="100vh"><Loader /></Center>;

  if (error || !data) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" variant="light">{error ?? "Community not found."}</Alert>
      </Container>
    );
  }

  if (!data.is_publicly_visible) {
    return (
      <Container size="sm" py="xl" style={brandCssVars(data.theme)}>
        <Stack align="center" gap="md">
          <CommunityHeader community={data} />
          <Text c="dimmed" ta="center">This community's directory is temporarily unavailable.</Text>
        </Stack>
      </Container>
    );
  }

  function handleRequest(pro: CommunityProOut) {
    if (data!.is_read_only) return;
    if (status !== "authenticated") {
      navigate(`/login?returnTo=/community/${slug}`);
      return;
    }
    setRequestPro(pro);
  }

  async function handleJoinClick() {
    if (data!.is_read_only) return;
    if (status !== "authenticated") {
      setJoinOpen(true);
      return;
    }
    setJoining(true);
    try {
      const res = await communityFetch(`/api/communities/${slug}/join`, { method: "POST" });
      if (res.ok) await refetch();
    } finally {
      setJoining(false);
    }
  }

  function handleCopyUrl() {
    void navigator.clipboard.writeText(`https://gigkraft.com/community/${slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setLinkCopyCount((n) => n + 1);
    void communityFetch(`/api/communities/${slug}/copy-link`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { link_copy_count: number } | null) => {
        if (body) setLinkCopyCount(body.link_copy_count);
      })
      .catch(() => {});
  }

  const isMemberOrHigher = data.viewer_status === "owner" || data.viewer_status === "moderator" || data.viewer_status === "member";
  const isViewerMember = status === "authenticated" && isMemberOrHigher;
  const memberName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const stats = [
    { icon: <IconBriefcase size={16} />, count: data.pro_count, label: "Pros", color: "var(--mantine-color-green-6)" },
    { icon: <IconUsers size={16} />, count: data.member_count, label: "Members", color: "var(--mantine-color-red-6)" },
    { icon: <IconEye size={16} />, count: data.page_views, label: "Views", color: "var(--gk-accent-primary)" },
    { icon: <IconLink size={16} />, count: linkCopyCount, label: "Copied", color: "var(--mantine-color-grape-6)" },
  ] as const;

  return (
    <div style={brandCssVars(data.theme)}>
      <div style={{ maxWidth: 1320, margin: "0", padding: "14px 32px 32px" }}>
        {/* ── Top: community line ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            paddingBottom: 8,
            marginBottom: data.description ? 4 : 10,
            borderBottom: "1.5px solid var(--gk-accent-primary)",
          }}
        >
          <Group gap="sm" wrap="nowrap" align="center">
            <Avatar
              src={data.cover_image_url || undefined}
              size={44}
              radius="xl"
              color="teal"
              style={{ border: "2px solid var(--gk-accent-primary)", flexShrink: 0 }}
            >
              <IconUsersGroup size={18} />
            </Avatar>

            <Group gap={10} wrap="wrap" align="center">
              <Title order={5} style={{ wordBreak: "break-word", color: "var(--gk-accent-secondary)" }}>
                {data.name}
              </Title>

              {data.status === "archived" ? (
                <Badge color="gray" variant="filled" size="xs" style={{ width: "fit-content" }}>
                  Managed by {data.lead_name} · Archived
                </Badge>
              ) : (
                <Group gap={6} wrap="nowrap">
                  <Avatar src={data.lead_avatar_url || undefined} size={18} radius="xl" color="teal" style={{ fontSize: 10 }}>
                    {data.lead_name[0]?.toUpperCase()}
                  </Avatar>
                  <Text size="xs" c="dimmed">Maintained by {data.lead_name}</Text>
                  {data.viewer_status !== "owner" && !data.is_read_only && (
                    <Tooltip label={`Message ${data.lead_name}`} withArrow>
                      <button
                        onClick={() => setMessageOwnerOpen(true)}
                        aria-label={`Message ${data.lead_name}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          border: "none",
                          background: "transparent",
                          color: "var(--gk-accent-primary)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: 0,
                        }}
                      >
                        <IconMessage size={13} />
                        Chat
                      </button>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Group>
          </Group>

          <Group gap="lg" wrap="nowrap" align="center">
            <Group gap="md" wrap="nowrap">
              {stats.map(({ icon, count, label, color }) => (
                <Group key={label} gap={4} wrap="nowrap">
                  <Center style={{ color }}>{icon}</Center>
                  <Text size="sm" fw={700} lh={1} style={{ color }}>{count}</Text>
                  <Text size="xs" c="dimmed">{label}</Text>
                </Group>
              ))}
            </Group>

            <IconAction
              label={copied ? "Copied!" : "Copy page link"}
              onClick={handleCopyUrl}
              color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-primary)"}
            >
              {copied ? <IconCheck size={18} /> : <IconLink size={18} />}
            </IconAction>

            {(data.viewer_status === "none" || data.viewer_status == null) && !data.is_read_only && (
              <button
                style={{ ...joinBtn, width: "auto", padding: "8px 20px", opacity: joining ? 0.7 : 1 }}
                disabled={joining}
                onClick={() => void handleJoinClick()}
              >
                <IconUsersGroup size={15} color="#fff" />
                Join This Community
              </button>
            )}
          </Group>
        </div>

        {data.description && (
          <Text size="xs" fs="italic" c="dimmed" mb="sm">
            {data.description}
          </Text>
        )}

        <Group align="flex-start" gap="lg" wrap="wrap">
          {/* ── Left: filters — a scrollable line running top to bottom ── */}
          {(uniqueTrades.length > 0 || uniqueTags.length > 0) && (
            <div
              className="gk-slick-scroll"
              style={{
                width: 220,
                flexShrink: 0,
                position: "sticky",
                top: 14,
                alignSelf: "flex-start",
                maxHeight: "calc(100vh - 28px)",
                overflowY: "auto",
                borderRight: "1.5px solid var(--gk-accent-secondary)",
                paddingRight: 16,
              }}
            >
              <Text fw={700} size="sm" mb={6} style={iconColor}>Filters</Text>
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
            </div>
          )}

          {/* ── Right: Search + pros grid ── */}
          <Stack gap="md" style={{ flex: 1, minWidth: 280 }}>
          {isViewerMember && (
            <Group gap={8} align="center">
              <Avatar
                src={avatarSrc}
                size={32}
                radius="xl"
                color="teal"
                style={{ border: "1.5px solid var(--gk-accent-primary)" }}
              >
                {memberName?.[0]?.toUpperCase()}
              </Avatar>
              <Text size="sm" fw={600}>{memberName}</Text>
            </Group>
          )}

          <TextInput
            placeholder="Search by name, trade, tag…"
            leftSection={<IconSearch size={15} style={{ color: "var(--gk-accent-primary)" }} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl"
            styles={{
              input: {
                borderColor: "var(--gk-accent-primary)",
                borderWidth: 1.5,
              },
            }}
          />

          {data.pros.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No pros on this list yet.</Text>
          ) : filteredPros.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No pros match the current filters.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
              {filteredPros.map((pro) => (
                <CommunityProCard
                  key={pro.id}
                  pro={pro}
                  disabled={data.is_read_only}
                  leadName={data.lead_name}
                  onRequest={handleRequest}
                  onTagClick={toggleTag}
                  blurred={!isAuthenticated}
                  favorite={pro.pro_id != null ? {
                    isFavorited: favIds.has(pro.pro_id),
                    onToggle: () => toggleFavorite(pro.pro_id!),
                    isAuthenticated,
                  } : undefined}
                />
              ))}
            </SimpleGrid>
          )}

          {isMemberOrHigher && slug && (
            <Stack gap="sm">
              <Text fw={700} size="sm" style={iconColor}>Members</Text>
              <PublicMembersList slug={slug} />
            </Stack>
          )}
        </Stack>
        </Group>

        <Text ta="center" size="xs" c="dimmed" mt="xl">
          Powered by{" "}
          <a href="https://gigkraft.com" style={{ color: "inherit" }}>
            gigKraft.com
          </a>
        </Text>
      </div>

      <RequestCommunityProModal
        opened={!!requestPro}
        onClose={() => setRequestPro(null)}
        slug={slug ?? ""}
        pro={requestPro}
      />

      <JoinCommunityModal
        opened={joinOpen}
        onClose={() => setJoinOpen(false)}
        slug={slug ?? ""}
        communityName={data.name}
        coverImageUrl={data.cover_image_url}
        theme={data.theme}
        onJoined={() => void refetch()}
      />

      <MessageOwnerModal
        opened={messageOwnerOpen}
        onClose={() => setMessageOwnerOpen(false)}
        slug={slug ?? ""}
        ownerName={data.lead_name}
      />
    </div>
  );
}
