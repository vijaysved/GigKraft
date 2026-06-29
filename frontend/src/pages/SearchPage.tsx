import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconFilter, IconHeart, IconHeartFilled, IconMapPin, IconSearch, IconSend } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  searchProsPublic,
  submitRfq,
  submitZipWaitlist,
  trackSitePageView,
  type ProOut,
} from "../api/endpoints";
import { LocationBadge } from "../components/LocationBadge";
import { useFavorites } from "../hooks/useFavorites";
import { useZipState } from "../hooks/useZipState";

declare function gtag(command: string, ...args: unknown[]): void;

const IS_DEV_MACHINE =
  localStorage.getItem("gk_dev_mode") === "true" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ── Trade taxonomy ────────────────────────────────────────────────────────────

interface CategoryDef {
  label: string;
  gradient: string;
  light: string;
  textColor: string;
  subcategories: string[];
}

const CATEGORIES: Record<string, CategoryDef> = {
  "Remodeling & Build": {
    label: "Remodeling & Build",
    gradient: "linear-gradient(135deg,#7900FF,#FF0055)",
    light: "#F3E8FF",
    textColor: "#7900FF",
    subcategories: [
      "Additions & Remodels",
      "Builders (New Homes)",
      "Architects & Designers",
      "Decorators & Designers",
      "Foundations",
      "Kitchen / Bathroom",
    ],
  },
  "Licensed Home Systems": {
    label: "Licensed Home Systems",
    gradient: "linear-gradient(135deg,#0055FF,#00E5FF)",
    light: "#E0F2FF",
    textColor: "#0055FF",
    subcategories: ["Plumbing", "Electrical", "HVAC", "Pools, Spas & Hot Tubs"],
  },
  "Interior Finishes": {
    label: "Interior Finishes",
    gradient: "linear-gradient(135deg,#FF6B1A,#FFB800)",
    light: "#FFF4E0",
    textColor: "#C84F00",
    subcategories: [
      "Drywall & Insulation",
      "Painting & Staining",
      "Flooring & Carpet",
      "Tile & Stone",
      "Carpentry & Cabinets",
    ],
  },
  "Exterior & Hardscape": {
    label: "Exterior & Hardscape",
    gradient: "linear-gradient(135deg,#16A34A,#00C8A0)",
    light: "#DCFCE7",
    textColor: "#16A34A",
    subcategories: [
      "Roofing, Siding & Gutters",
      "Windows & Doors",
      "Garages & Openers",
      "Concrete, Brick & Stone",
      "Decks, Porches & Fences",
    ],
  },
  "Maintenance & Handyman": {
    label: "Maintenance & Handyman",
    gradient: "linear-gradient(135deg,#FF5E00,#FFBA00)",
    light: "#FFF3E0",
    textColor: "#E04500",
    subcategories: ["Handyman Services", "Lawn, Trees & Shrubs", "Cleaning Services"],
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

// Tier-based fallback gradients when no category is assigned
const PRO_GRADIENT   = "linear-gradient(135deg,#FF0055,#00C8FF)";  // GigKraft brand
const MEMBER_GRADIENT = "linear-gradient(135deg,#9CA3AF,#6B7280)"; // muted silver

function proGradient(pro: ProOut): string {
  const primary = pro.trade_categories?.[0]?.category;
  if (primary && CATEGORIES[primary]) return CATEGORIES[primary].gradient;
  return pro.role === "member" ? MEMBER_GRADIENT : PRO_GRADIENT;
}

// ── Pro card ──────────────────────────────────────────────────────────────────

function ProCard({
  pro,
  onClick,
  isFavorited,
  onToggleFavorite,
  isAuthenticated,
}: {
  pro: ProOut;
  onClick: () => void;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  isAuthenticated: boolean;
}) {
  const gradient = proGradient(pro);
  const isPro = pro.role !== "member";
  const initials = pro.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const primaryCat = pro.trade_categories?.[0];
  const tradeLine = primaryCat
    ? `${primaryCat.subcategories?.[0] ?? ""} · ${primaryCat.category}`.replace(/^· /, "")
    : pro.primary_trade || "General";

  return (
    <Card
      withBorder={false}
      radius="lg"
      padding={0}
      shadow="sm"
      style={{ cursor: "pointer", overflow: "visible", position: "relative" }}
      onClick={onClick}
    >
      {/* Gradient hero strip */}
      <Box
        style={{
          height: 72,
          background: gradient,
          borderRadius: "var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0",
          position: "relative",
        }}
      >
        {/* Tier badge — standard color regardless of card gradient */}
        <Box
          style={{
            position: "absolute",
            top: 10,
            right: 44,
            padding: "3px 10px",
            borderRadius: 20,
            background: isPro ? "#00C8FF" : "rgba(255,255,255,0.92)",
            color: isPro ? "#003344" : "#555",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.3,
            boxShadow: "0 1px 4px rgba(0,0,0,.15)",
          }}
        >
          {isPro ? "⚡ Pro" : "Member"}
        </Box>

        {/* Favorite heart button */}
        <Tooltip
          label={isAuthenticated ? (isFavorited ? "Remove from favorites" : "Save to favorites") : "Sign in to save favorites"}
          position="top"
          withArrow
        >
          <Box
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(pro.id); }}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
              transition: "transform .12s",
            }}
          >
            {isFavorited
              ? <IconHeartFilled size={15} color="#FF0055" />
              : <IconHeart size={15} color="#999" />}
          </Box>
        </Tooltip>
      </Box>

      {/* Avatar overlapping the strip */}
      <Box
        style={{
          position: "absolute",
          top: 42,
          left: 16,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "3px solid #fff",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,.18)",
          zIndex: 2,
        }}
      >
        {pro.avatar_url ? (
          <img src={pro.avatar_url} alt={pro.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box
            style={{
              width: "100%",
              height: "100%",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {initials}
          </Box>
        )}
      </Box>

      {/* Card body */}
      <Box style={{ padding: "36px 16px 16px", background: "#fff", borderRadius: "0 0 var(--mantine-radius-lg) var(--mantine-radius-lg)" }}>
        <Text fw={800} size="md" lineClamp={1}>{pro.name}</Text>
        <Text size="xs" c="dimmed" mb="sm" lineClamp={1}>{tradeLine}</Text>

        {/* Stats pills */}
        <Group gap={6} mb="sm" wrap="wrap">
          {pro.response_hours > 0 && (
            <Badge variant="light" color="gray" size="sm" radius="xl">
              ⚡ {pro.response_hours}h avg
            </Badge>
          )}
          {pro.stats.krafts_verified > 0 && (
            <Badge variant="light" color="green" size="sm" radius="xl">
              🔨 {pro.stats.krafts_verified} Kraft{pro.stats.krafts_verified !== 1 ? "s" : ""}
            </Badge>
          )}
          {pro.stats.recs_approved > 0 && (
            <Badge variant="light" color="cyan" size="sm" radius="xl">
              ⭐ {pro.stats.recs_approved} rec{pro.stats.recs_approved !== 1 ? "s" : ""}
            </Badge>
          )}
        </Group>

        {/* Credentials */}
        <Group gap={6} wrap="wrap">
          {pro.licensed && (
            <Badge size="xs" color="teal" variant="light">Licensed</Badge>
          )}
          {pro.insured && (
            <Badge size="xs" color="blue" variant="light">Insured</Badge>
          )}
        </Group>
      </Box>
    </Card>
  );
}

// ── RFQ form ──────────────────────────────────────────────────────────────────

function RfqForm({ initialCategory, initialZip }: { initialCategory: string; initialZip: string }) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [subcategory, setSubcategory] = useState("");
  const [timeline, setTimeline] = useState("");
  const [zip, setZip] = useState(initialZip || "");
  const [budget, setBudget] = useState("no_pref");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: number; matched_pro_count: number } | null>(null);
  const [error, setError] = useState("");

  const subcats = category ? (CATEGORIES[category]?.subcategories ?? []) : [];

  function valid() {
    return (
      description.trim().length >= 20 &&
      category &&
      timeline &&
      zip.trim().length >= 5 &&
      name.trim().length >= 2 &&
      contact.trim().length >= 5
    );
  }

  async function handleSubmit() {
    if (!valid()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await submitRfq({
        description: description.trim(),
        category,
        subcategory: subcategory || undefined,
        timeline: timeline as "this_week" | "next_month" | "just_planning",
        zip_code: zip.trim(),
        budget,
        requester_name: name.trim(),
        requester_contact: contact.trim(),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card withBorder radius="lg" padding="xl" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <Text size="xl" mb="xs">✅ Request sent!</Text>
        <Text c="dimmed" mb="sm">
          We've notified {result.matched_pro_count > 0 ? `${result.matched_pro_count} pro${result.matched_pro_count !== 1 ? "s" : ""}` : "our team"} in your area.
          You should hear back within a few hours.
        </Text>
        <Text size="xs" c="dimmed">Reference #{result.id}</Text>
      </Card>
    );
  }

  return (
    <Box style={{ maxWidth: 560, margin: "0 auto" }}>
      <Stack gap="md">
        <Textarea
          label="Describe what you need"
          placeholder={`Describe your project — the more detail, the better quotes you'll get.\n\nFor example:\n• What's the problem or project?\n• How urgent is it?\n• Any access constraints (second floor, crawl space)?\n• Preferred days/times for a visit?`}
          minRows={6}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          description={`${description.trim().length}/20 min`}
          error={description.trim().length > 0 && description.trim().length < 20 ? "Keep going — at least 20 characters" : undefined}
        />

        <Text size="sm" fw={700} c="dimmed">4 quick details</Text>

        <Select
          label="Category"
          placeholder="Select a trade category"
          required
          data={CATEGORY_KEYS}
          value={category || null}
          onChange={(v) => { setCategory(v ?? ""); setSubcategory(""); }}
        />

        {subcats.length > 0 && (
          <Select
            label="Subcategory"
            placeholder="Optional — narrow it down"
            data={["", ...subcats]}
            value={subcategory || null}
            onChange={(v) => setSubcategory(v ?? "")}
            clearable
          />
        )}

        <Box>
          <Text size="sm" fw={500} mb={6}>Timeline <span style={{ color: "red" }}>*</span></Text>
          <Group gap="xs">
            {[
              { value: "this_week", label: "This week" },
              { value: "next_month", label: "Next month" },
              { value: "just_planning", label: "Just planning" },
            ].map((opt) => (
              <Chip
                key={opt.value}
                value={opt.value}
                checked={timeline === opt.value}
                onChange={() => setTimeline(timeline === opt.value ? "" : opt.value)}
              >
                {opt.label}
              </Chip>
            ))}
          </Group>
        </Box>

        <TextInput
          label="ZIP code"
          placeholder="e.g. 78701"
          leftSection={<IconMapPin size={15} />}
          required
          value={zip}
          onChange={(e) => setZip(e.currentTarget.value)}
          maxLength={10}
          w={180}
        />

        <Select
          label="Budget (optional)"
          data={[
            { value: "no_pref", label: "No preference" },
            { value: "under_500", label: "Under $500" },
            { value: "500_2k", label: "$500–$2k" },
            { value: "2k_10k", label: "$2k–$10k" },
            { value: "over_10k", label: "$10k+" },
          ]}
          value={budget}
          onChange={(v) => setBudget(v ?? "no_pref")}
        />

        <Text size="sm" fw={700} c="dimmed" mt="xs">Your contact info</Text>

        <SimpleGrid cols={2}>
          <TextInput
            label="Your name"
            placeholder="First name"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            label="Phone or email"
            placeholder="so pros can reach you"
            required
            value={contact}
            onChange={(e) => setContact(e.currentTarget.value)}
          />
        </SimpleGrid>

        {error && <Alert color="red" variant="light">{error}</Alert>}

        <Button
          size="md"
          leftSection={<IconSend size={16} />}
          disabled={!valid()}
          loading={submitting}
          onClick={handleSubmit}
        >
          Send Quote Request
        </Button>
      </Stack>
    </Box>
  );
}

// ── Service area bar ─────────────────────────────────────────────────────────

function ServiceAreaBar({
  pros,
  activeZip,
  onZipClick,
}: {
  pros: ProOut[];
  activeZip: string;
  onZipClick: (zip: string) => void;
}) {
  const zips = Array.from(
    new Set(
      pros.flatMap((p) => [
        p.base_zip,
        ...(Array.isArray(p.service_zips) ? p.service_zips : []),
      ]).filter(Boolean)
    )
  ).sort();

  if (zips.length === 0) return null;

  return (
    <Box>
      <Group gap={6} mb={8} align="center">
        <IconMapPin size={13} color="#888" />
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 0.5 }}>
          Service areas we cover
        </Text>
      </Group>
      <Group gap={6} wrap="wrap">
        {zips.map((z) => {
          const isActive = activeZip === z;
          return (
            <Box
              key={z}
              onClick={() => onZipClick(z)}
              style={{
                padding: "4px 11px",
                borderRadius: 12,
                background: isActive ? "#1A1A1A" : "#F0F0F0",
                color: isActive ? "#fff" : "#555",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "monospace",
                cursor: "pointer",
                border: isActive ? "none" : "1.5px solid #E0E0E0",
                transition: "all .12s",
              }}
            >
              {z}
            </Box>
          );
        })}
        {activeZip && (
          <Box
            onClick={() => onZipClick(activeZip)}
            style={{
              padding: "4px 10px",
              borderRadius: 12,
              background: "transparent",
              color: "#888",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear
          </Box>
        )}
      </Group>
    </Box>
  );
}

// ── Search page ───────────────────────────────────────────────────────────────

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") ?? "search");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [activeSubcategory, setActiveSubcategory] = useState(searchParams.get("subcategory") ?? "");
  const {
    zip,
    setZip,
    clearZip,
    source: zipSource,
    pendingGeoZip,
    pendingGeoCity,
    pendingGeoState,
    confirmGeoZip,
    declineGeoZip,
  } = useZipState();

  // Clean URL route: /gigs/:state/:cityzip  (e.g. /gigs/tx/austin-78701)
  const { cityzip, state: urlState } = useParams<{ state?: string; cityzip?: string }>();
  const cleanUrlZip = cityzip?.match(/(\d{5})$/)?.[1] ?? "";
  const cleanUrlCity = cityzip
    ? cityzip
        .replace(/-\d{5}$/, "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";
  const isCleanUrl = !!cityzip && /^\d{5}$/.test(cleanUrlZip);

  // On clean-URL mount, seed the zip from the path param
  useEffect(() => {
    if (isCleanUrl && cleanUrlZip && cleanUrlZip !== zip) {
      setZip(cleanUrlZip);
    }
  // Run once; cityzip is stable for the life of this route render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanUrlZip]);

  // Local display state for the ZIP text input (allows partial typing without triggering search)
  const [zipInputValue, setZipInputValue] = useState(zip);

  // Attribute filters
  const [filterLicensed, setFilterLicensed] = useState(false);
  const [filterInsured, setFilterInsured] = useState(false);
  const [filterResponseHours, setFilterResponseHours] = useState<number | null>(null);
  const [filterMinKrafts, setFilterMinKrafts] = useState<number | null>(null);
  const [filterMinRecs, setFilterMinRecs] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { favIds, toggle: toggleFavorite, isAuthenticated } = useFavorites();

  const [pros, setPros] = useState<ProOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Waitlist lead capture (shown on zero-results after radius expansion)
  const [waitlistContact, setWaitlistContact] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Keep ZIP text input in sync when zip changes externally (LocationBadge, ServiceAreaBar)
  const prevZipRef = useRef(zip);
  useEffect(() => {
    if (prevZipRef.current !== zip) {
      setZipInputValue(zip);
      prevZipRef.current = zip;
    }
  }, [zip]);

  useEffect(() => {
    trackSitePageView(window.location.href);
    if (!IS_DEV_MACHINE && typeof gtag !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      gtag("event", "search_page_loaded", {
        location_source: zipSource,
        zip_code: zip || null,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      });
      if (zip) gtag("set", "user_properties", { active_zip: zip });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const urlParams: Record<string, string> = { tab: "search" };
      if (query) urlParams.q = query;
      if (activeCategory) urlParams.category = activeCategory;
      if (activeSubcategory) urlParams.subcategory = activeSubcategory;
      if (zip) urlParams.zip = zip;
      setSearchParams(urlParams, { replace: true });

      setLoading(true);
      setWaitlistSubmitted(false);
      setWaitlistContact("");

      const baseArgs = {
        q: query || undefined,
        zip: zip || undefined,
        category: activeCategory || undefined,
        subcategory: activeSubcategory || undefined,
        licensed: filterLicensed || undefined,
        insured: filterInsured || undefined,
        max_response_hours: filterResponseHours ?? undefined,
        min_krafts: filterMinKrafts ?? undefined,
        min_recs: filterMinRecs ?? undefined,
      };

      try {
        let result = await searchProsPublic(baseArgs);

        // Radius expansion: silently retry with wider radius on zero results (only when zip set)
        if (result.length === 0 && zip) {
          result = await searchProsPublic({ ...baseArgs, radius: 15 }).catch(() => []);
        }
        if (result.length === 0 && zip) {
          result = await searchProsPublic({ ...baseArgs, radius: 30 }).catch(() => []);
        }

        setPros(result);
        if (!IS_DEV_MACHINE && typeof gtag !== "undefined") {
          gtag("event", "search_performed", {
            zip_code: zip || null,
            results_count: result.length,
            utm_source: searchParams.get("utm_source"),
            utm_medium: searchParams.get("utm_medium"),
            utm_campaign: searchParams.get("utm_campaign"),
          });
        }
      } catch {
        setPros([]);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [
    query, activeCategory, activeSubcategory, zip, activeTab,
    filterLicensed, filterInsured, filterResponseHours, filterMinKrafts, filterMinRecs,
    setSearchParams, searchParams,
  ]);

  function handleCategoryClick(key: string) {
    if (activeCategory === key) {
      setActiveCategory("");
      setActiveSubcategory("");
    } else {
      setActiveCategory(key);
      setActiveSubcategory("");
    }
  }

  const subcategories = activeCategory ? (CATEGORIES[activeCategory]?.subcategories ?? []) : [];

  const activeFilterCount = [
    filterLicensed, filterInsured,
    filterResponseHours != null, filterMinKrafts != null, filterMinRecs != null,
  ].filter(Boolean).length;

  // Dynamic page title + noindex for query-string search URLs
  const pageTitle = isCleanUrl
    ? `Pros in ${cleanUrlCity}${urlState ? `, ${urlState.toUpperCase()}` : ""} — GigKraft`
    : zip
    ? `Pros near ${zip} — GigKraft`
    : "Find Local Pros — GigKraft";

  return (
    <Box style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 80px" }}>
      <Helmet>
        <title>{pageTitle}</title>
        {!isCleanUrl && zip && <meta name="robots" content="noindex, follow" />}
        {isCleanUrl && (
          <meta
            name="description"
            content={`Find trusted pros near ${cleanUrlCity}${urlState ? `, ${urlState.toUpperCase()}` : ""} on GigKraft.`}
          />
        )}
      </Helmet>

      <Stack gap="md">
        <Group gap="sm" align="baseline" wrap="nowrap">
          <Title order={2} style={{ fontWeight: 800, whiteSpace: "nowrap" }}>Find a Pro</Title>
          <Text c="dimmed" size="sm">Professionals in your area, backed by real reviews.</Text>
        </Group>

        {/* Tab switcher */}
        <Tabs value={activeTab} onChange={(v) => { setActiveTab(v ?? "search"); setSearchParams({ tab: v ?? "search" }, { replace: true }); }}>
          <Tabs.List>
            <Tabs.Tab value="search" leftSection={<IconSearch size={15} />}>
              Search
            </Tabs.Tab>
            <Tabs.Tab value="type" leftSection={<span style={{ fontSize: 14 }}>✏️</span>}>
              Type it out
            </Tabs.Tab>
          </Tabs.List>

          {/* ── Search tab ── */}
          <Tabs.Panel value="search" pt="lg">
            <Stack gap="md">
              {/* IP-geo confirmation banner — shown when geo detected a location but user hasn't confirmed */}
              {pendingGeoZip && !zip && (
                <Alert
                  icon={<IconMapPin size={15} />}
                  color="blue"
                  variant="light"
                  style={{ maxWidth: 520 }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Text size="sm">
                      We detected you're near{" "}
                      <Text component="span" fw={600}>
                        {pendingGeoCity}{pendingGeoState ? `, ${pendingGeoState}` : ""}
                      </Text>{" "}
                      ({pendingGeoZip}).
                    </Text>
                    <Group gap="xs">
                      <Button size="xs" onClick={confirmGeoZip}>
                        Use this location
                      </Button>
                      <Button size="xs" variant="subtle" color="gray" onClick={declineGeoZip}>
                        Dismiss
                      </Button>
                    </Group>
                  </Group>
                </Alert>
              )}

              {/* Location badge — always visible, shows active ZIP with inline change */}
              <LocationBadge zip={zip} setZip={setZip} clearZip={clearZip} />

              {/* Coverage area ZIPs — quick zip filters derived from result set */}
              {pros.length > 0 && (
                <ServiceAreaBar
                  pros={pros}
                  activeZip={zip}
                  onZipClick={(z) => (zip === z ? clearZip() : setZip(z))}
                />
              )}

              {/* Search + ZIP row */}
              <Group align="flex-end" gap="sm" wrap="wrap">
                <TextInput
                  placeholder="Search by name, trade, or skill…"
                  leftSection={<IconSearch size={16} />}
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  style={{ flex: "1 1 280px", minWidth: 220 }}
                />
                <TextInput
                  placeholder="ZIP code"
                  leftSection={<IconMapPin size={16} />}
                  value={zipInputValue}
                  onChange={(e) => {
                    const val = e.currentTarget.value.replace(/\D/g, "").slice(0, 5);
                    setZipInputValue(val);
                    if (/^\d{5}$/.test(val)) setZip(val);
                    else if (val === "") clearZip();
                  }}
                  style={{ width: 150 }}
                  maxLength={5}
                />
                <Button
                  variant={activeFilterCount > 0 ? "filled" : "light"}
                  color={activeFilterCount > 0 ? "dark" : "gray"}
                  leftSection={<IconFilter size={15} />}
                  onClick={() => setShowFilters((v) => !v)}
                  size="sm"
                  px="md"
                >
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Button>
              </Group>

              {/* Expandable filter row */}
              {showFilters && (
                <Box
                  style={{
                    background: "#F9F9F9",
                    border: "1px solid #E8E8E8",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <Group gap="xl" wrap="wrap" align="flex-start">
                    {/* Toggles */}
                    <Stack gap="xs">
                      <Switch
                        label="Licensed"
                        size="sm"
                        checked={filterLicensed}
                        onChange={(e) => setFilterLicensed(e.currentTarget.checked)}
                      />
                      <Switch
                        label="Insured"
                        size="sm"
                        checked={filterInsured}
                        onChange={(e) => setFilterInsured(e.currentTarget.checked)}
                      />
                    </Stack>

                    {/* Response time */}
                    <Select
                      label="Response time"
                      placeholder="Any"
                      size="sm"
                      w={150}
                      clearable
                      data={[
                        { value: "2", label: "≤ 2 hours" },
                        { value: "4", label: "≤ 4 hours" },
                        { value: "8", label: "≤ 8 hours" },
                        { value: "24", label: "≤ 24 hours" },
                      ]}
                      value={filterResponseHours != null ? String(filterResponseHours) : null}
                      onChange={(v) => setFilterResponseHours(v ? parseInt(v) : null)}
                    />

                    {/* Min Krafts */}
                    <Select
                      label="Min Krafts"
                      placeholder="Any"
                      size="sm"
                      w={130}
                      clearable
                      data={[
                        { value: "1", label: "1+" },
                        { value: "3", label: "3+" },
                        { value: "5", label: "5+" },
                        { value: "10", label: "10+" },
                      ]}
                      value={filterMinKrafts != null ? String(filterMinKrafts) : null}
                      onChange={(v) => setFilterMinKrafts(v ? parseInt(v) : null)}
                    />

                    {/* Min Recs */}
                    <Select
                      label="Min Recs"
                      placeholder="Any"
                      size="sm"
                      w={130}
                      clearable
                      data={[
                        { value: "1", label: "1+" },
                        { value: "5", label: "5+" },
                        { value: "10", label: "10+" },
                      ]}
                      value={filterMinRecs != null ? String(filterMinRecs) : null}
                      onChange={(v) => setFilterMinRecs(v ? parseInt(v) : null)}
                    />

                    {activeFilterCount > 0 && (
                      <Box style={{ alignSelf: "flex-end", paddingBottom: 2 }}>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            setFilterLicensed(false);
                            setFilterInsured(false);
                            setFilterResponseHours(null);
                            setFilterMinKrafts(null);
                            setFilterMinRecs(null);
                          }}
                        >
                          Clear all
                        </Button>
                      </Box>
                    )}
                  </Group>
                </Box>
              )}

              {/* Category chips */}
              <Group gap="xs" wrap="wrap">
                <Box
                  onClick={() => { setActiveCategory(""); setActiveSubcategory(""); }}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: !activeCategory ? "#1A1A1A" : "#F0F0F0",
                    color: !activeCategory ? "#fff" : "#555",
                    transition: "all .15s",
                  }}
                >
                  All
                </Box>
                {CATEGORY_KEYS.map((key) => {
                  const cat = CATEGORIES[key];
                  const isActive = activeCategory === key;
                  return (
                    <Box
                      key={key}
                      onClick={() => handleCategoryClick(key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "7px 16px",
                        borderRadius: 24,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: isActive ? cat.gradient : cat.light,
                        color: isActive ? "#fff" : cat.textColor,
                        border: isActive ? "none" : `1.5px solid ${cat.textColor}30`,
                        transition: "all .15s",
                      }}
                    >
                      {!isActive && (
                        <Box
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: cat.gradient,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {isActive && <IconCheck size={13} />}
                      {cat.label}
                    </Box>
                  );
                })}
              </Group>

              {/* Subcategory chips */}
              {subcategories.length > 0 && (
                <Group gap="xs" wrap="wrap">
                  <Chip.Group value={activeSubcategory} onChange={(v) => setActiveSubcategory(v as string)}>
                    <Chip value="" size="sm">All</Chip>
                    {subcategories.map((sub) => (
                      <Chip key={sub} value={sub} size="sm">{sub}</Chip>
                    ))}
                  </Chip.Group>
                </Group>
              )}

              {/* Results */}
              {!hasLoaded && loading ? (
                <Group justify="center" py="xl"><Loader size="md" /></Group>
              ) : pros.length === 0 && !loading ? (
                zip ? (
                  <Stack align="center" gap="md" py="xl">
                    <Text size="sm" c="dimmed" ta="center">
                      No pros found near <Text component="span" fw={600}>{zip}</Text> yet.
                    </Text>
                    {waitlistSubmitted ? (
                      <Alert color="green" icon={<IconCheck size={16} />} style={{ maxWidth: 380 }}>
                        We'll notify you when pros open up in {zip}.
                      </Alert>
                    ) : (
                      <Stack align="center" gap="xs" style={{ maxWidth: 380, width: "100%" }}>
                        <Text size="xs" c="dimmed" ta="center">Get notified when gigs open in {zip}</Text>
                        <Group gap="xs" style={{ width: "100%" }}>
                          <TextInput
                            placeholder="Your email or phone"
                            value={waitlistContact}
                            onChange={(e) => setWaitlistContact(e.currentTarget.value)}
                            style={{ flex: 1 }}
                            size="sm"
                          />
                          <Button
                            size="sm"
                            loading={waitlistLoading}
                            leftSection={<IconSend size={14} />}
                            onClick={async () => {
                              if (!waitlistContact.trim()) return;
                              setWaitlistLoading(true);
                              try {
                                await submitZipWaitlist({ zip, contact: waitlistContact.trim() });
                                setWaitlistSubmitted(true);
                              } catch { /* ignore */ }
                              setWaitlistLoading(false);
                            }}
                          >
                            Notify me
                          </Button>
                        </Group>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    No pros found. Try a different search or ZIP code.
                  </Text>
                )
              ) : (
                <Stack gap="xs" style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.18s" }}>
                  <Group gap="xs" align="center">
                    <Text size="xs" c="dimmed">{pros.length} pro{pros.length !== 1 ? "s" : ""} found</Text>
                    {loading && <Loader size="xs" />}
                  </Group>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                    {pros.map((pro) => (
                      <ProCard
                        key={pro.id}
                        pro={pro}
                        onClick={() => pro.handle && navigate(`/pros/${pro.handle}`)}
                        isFavorited={favIds.has(pro.id)}
                        onToggleFavorite={toggleFavorite}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

            </Stack>
          </Tabs.Panel>

          {/* ── Type tab ── */}
          <Tabs.Panel value="type" pt="lg">
            <RfqForm initialCategory={activeCategory} initialZip={zip} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
}
