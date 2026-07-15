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
} from "@mantine/core";
import { IconCheck, IconFilter, IconMapPin, IconPencil, IconSearch, IconSend, IconShieldCheck } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  searchProsPublic,
  submitRfq,
  submitZipWaitlist,
  trackSitePageView,
  type ProOut,
} from "../api/endpoints";
import { ProviderCard } from "../components/ProviderCard";
import { CollapsibleTags } from "../components/CollapsibleTags";
import { LocationBadge } from "../components/LocationBadge";
import { useFavorites } from "../hooks/useFavorites";
import { useZipState } from "../hooks/useZipState";
import { TAG_FILTER_COLOR } from "../theme/tagColor";
import { toCamelTag } from "../utils/tags";

declare function gtag(command: string, ...args: unknown[]): void;

const IS_DEV_MACHINE =
  localStorage.getItem("gk_dev_mode") === "true" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ── Trade taxonomy ────────────────────────────────────────────────────────────

interface CategoryDef {
  label: string;
  subcategories: string[];
}

const CATEGORIES: Record<string, CategoryDef> = {
  "Remodeling & Build": {
    label: "Remodeling & Build",
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
    subcategories: ["Plumbing", "Electrical", "HVAC", "Pools, Spas & Hot Tubs"],
  },
  "Interior Finishes": {
    label: "Interior Finishes",
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
    subcategories: ["Handyman Services", "Lawn, Trees & Shrubs", "Cleaning Services"],
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

// ── Pro card ──────────────────────────────────────────────────────────────────

function ProCard({
  pro,
  onClick,
  isFavorited,
  onToggleFavorite,
  isAuthenticated,
  onSkillClick,
}: {
  pro: ProOut;
  onClick: () => void;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  isAuthenticated: boolean;
  onSkillClick: (skill: string) => void;
}) {
  const primaryCat = pro.trade_categories?.[0];
  const tradeLine = primaryCat
    ? `${primaryCat.subcategories?.[0] ?? ""} · ${primaryCat.category}`.replace(/^· /, "")
    : pro.primary_trade || "General";

  return (
    <ProviderCard
      onClick={onClick}
      avatarUrl={pro.avatar_url}
      avatarSeed={pro.id}
      name={pro.name}
      tier={pro.role === "member" ? "referred" : "pro"}
      trade={tradeLine}
      respondsIn={pro.response_hours > 0 ? `~${pro.response_hours}h` : null}
      favorite={{ isFavorited, onToggle: () => onToggleFavorite(pro.id), isAuthenticated }}
    >
      <Group gap={4} mb={4} wrap="wrap" style={{ position: "relative", zIndex: 1 }}>
        {pro.stats.krafts_verified > 0 && (
          <Badge size="xs" variant="filled" style={{ backgroundColor: "var(--gk-accent-secondary)", color: "var(--gk-accent-primary)" }}>
            🔨 {pro.stats.krafts_verified} Kraft{pro.stats.krafts_verified !== 1 ? "s" : ""}
          </Badge>
        )}
        {pro.stats.recs_approved > 0 && (
          <Badge size="xs" variant="filled" style={{ backgroundColor: "var(--gk-accent-secondary)", color: "var(--gk-accent-primary)" }}>
            ⭐ {pro.stats.recs_approved} rec{pro.stats.recs_approved !== 1 ? "s" : ""}
          </Badge>
        )}
        {pro.licensed && (
          <Badge
            size="xs"
            variant="filled"
            leftSection={<IconShieldCheck size={10} />}
            style={{ backgroundColor: "var(--gk-accent-primary)", color: "var(--gk-accent-secondary)" }}
          >
            Licensed
          </Badge>
        )}
        {pro.insured && (
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

      <CollapsibleTags tags={pro.skill_tags} onTagClick={onSkillClick} />
    </ProviderCard>
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
        <IconMapPin size={13} color="var(--gk-text-muted)" />
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
                background: isActive ? "var(--gk-accent-primary)" : "var(--gk-bg-surface)",
                color: isActive ? "#000" : "var(--gk-text-muted)",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "monospace",
                cursor: "pointer",
                border: isActive ? "none" : "1.5px solid var(--gk-border)",
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
              color: "var(--gk-text-muted)",
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
  const [activeSkill, setActiveSkill] = useState(searchParams.get("skill") ?? "");
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
      if (activeSkill) urlParams.skill = activeSkill;
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
        skill: activeSkill || undefined,
        licensed: filterLicensed || undefined,
        insured: filterInsured || undefined,
        max_response_hours: filterResponseHours ?? undefined,
        min_krafts: filterMinKrafts ?? undefined,
        min_recs: filterMinRecs ?? undefined,
      };

      try {
        // Search is always radial (25mi default, applied server-side). Widen once
        // on zero results for genuinely sparse areas.
        let result = await searchProsPublic(baseArgs);

        if (result.length === 0 && zip) {
          result = await searchProsPublic({ ...baseArgs, radius: 50 }).catch(() => []);
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
    query, activeCategory, activeSubcategory, activeSkill, zip, activeTab,
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

  // Skill/tag filter pills — built from whatever's in the current result set, same
  // approach as CommunityPublicPage's uniqueTags.
  const uniqueSkills = useMemo(
    () => Array.from(new Set(pros.flatMap((p) => p.skill_tags))).sort(),
    [pros]
  );

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
            <Tabs.Tab value="type" leftSection={<IconPencil size={15} />}>
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
                  variant={activeFilterCount > 0 ? "filled" : "default"}
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
                    background: "var(--gk-bg-canvas)",
                    border: "1px solid var(--gk-border)",
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

              {/* Category pills — same treatment as CommunityPublicPage's trade/tag pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button
                  onClick={() => { setActiveCategory(""); setActiveSubcategory(""); }}
                  style={{
                    padding: "3px 11px",
                    borderRadius: 99,
                    border: "1.5px solid var(--gk-accent-primary)",
                    background: !activeCategory ? "var(--gk-accent-primary)" : "transparent",
                    color: !activeCategory ? "#000" : "var(--gk-accent-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  All
                </button>
                {CATEGORY_KEYS.map((key) => {
                  const cat = CATEGORIES[key];
                  const isActive = activeCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleCategoryClick(key)}
                      style={{
                        padding: "3px 11px",
                        borderRadius: 99,
                        border: "1.5px solid var(--gk-accent-primary)",
                        background: isActive ? "var(--gk-accent-primary)" : "transparent",
                        color: isActive ? "#000" : "var(--gk-accent-primary)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Subcategory pills */}
              {subcategories.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button
                    onClick={() => setActiveSubcategory("")}
                    style={{
                      padding: "3px 11px",
                      borderRadius: 99,
                      border: "1.5px solid var(--gk-accent-secondary)",
                      background: !activeSubcategory ? "var(--gk-accent-secondary)" : "transparent",
                      color: !activeSubcategory ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    All
                  </button>
                  {subcategories.map((sub) => {
                    const isActive = activeSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveSubcategory(isActive ? "" : sub)}
                        style={{
                          padding: "3px 11px",
                          borderRadius: 99,
                          border: "1.5px solid var(--gk-accent-secondary)",
                          background: isActive ? "var(--gk-accent-secondary)" : "transparent",
                          color: isActive ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Skill/tag pills — #tags are always filters, always blue */}
              {uniqueSkills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {uniqueSkills.map((skill) => {
                    const isActive = activeSkill === skill;
                    return (
                      <button
                        key={skill}
                        onClick={() => setActiveSkill(isActive ? "" : skill)}
                        style={{
                          padding: "3px 11px",
                          borderRadius: 99,
                          border: `1.5px solid ${TAG_FILTER_COLOR}`,
                          background: isActive ? TAG_FILTER_COLOR : "transparent",
                          color: isActive ? "#fff" : TAG_FILTER_COLOR,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        #{toCamelTag(skill)}
                      </button>
                    );
                  })}
                </div>
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
                        onSkillClick={(skill) => setActiveSkill((prev) => (prev === skill ? "" : skill))}
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
