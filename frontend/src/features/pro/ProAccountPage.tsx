import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Code,
  CopyButton,
  Divider,
  FileButton,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAt,
  IconCamera,
  IconCheck,
  IconCopy,
  IconCreditCard,
  IconDeviceFloppy,
  IconDownload,
  IconExternalLink,
  IconMail,
  IconMessage,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconShare,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

import { BillingTab } from "./BillingTab";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";

import { useAuth } from "../../auth/AuthContext";
import { ThemeSettingsCard } from "../../components/ThemeSettingsCard";
import { client } from "../../api/client";
import { getAccessToken } from "../../api/tokens";
import { API_BASE_URL } from "../../config";
import { listMyKrafts, type KraftOut } from "../../api/endpoints";
import { KraftCard } from "../../components/KraftCard";
import { ReviewsSection } from "../../components/ReviewsSection";
import { ImageCropModal } from "../../components/ImageCropModal";
import {
  clearAvatar,
  compressDataUrl,
  fileToDataUrl,
  loadAvatar,
  saveAvatar,
  useProAvatar,
} from "../../hooks/useProAvatar";
import { isValidHandle, sanitizeHandle, useProHandle } from "../../hooks/useProHandle";

// ── Constants ─────────────────────────────────────────────────────────────────
const TRADES = ["Plumber", "Electrician", "HVAC", "Carpenter", "Painter", "Roofer", "General contractor", "Other"];

const TRADE_SKILLS: Record<string, string[]> = {
  "Plumber":             ["Leak repair", "Drain cleaning", "Water heater", "Pipe installation", "Fixture install", "Emergency response"],
  "Electrician":         ["Wiring", "Panel upgrade", "Outlet install", "Lighting", "Circuit breaker", "EV charger"],
  "HVAC":                ["AC repair", "Furnace service", "Duct cleaning", "Installation", "Thermostat", "Refrigerant"],
  "Carpenter":           ["Framing", "Trim work", "Cabinet install", "Door & window", "Decking", "Flooring"],
  "Painter":             ["Interior", "Exterior", "Staining", "Wallpaper removal", "Drywall repair", "Cabinet painting"],
  "Roofer":              ["Shingle repair", "Flat roof", "Gutter install", "Inspection", "Skylight", "Flashing"],
  "General contractor":  ["Renovation", "New build", "Project mgmt", "Permits", "Subcontractor coord", "Budgeting"],
  "Other":               ["Handyman", "Assembly", "Mounting", "Repair", "Installation", "Maintenance"],
};

const WALLPAPERS: { id: number; label: string; gradient: string }[] = [
  { id: 0, label: "Brand",   gradient: "url('/brand/gigkraft-wallpaper.png')" },
  { id: 1, label: "Ocean",   gradient: "linear-gradient(135deg, #0D1B30 0%, #1B3D5C 100%)" },
  { id: 2, label: "Sunset",  gradient: "linear-gradient(135deg, #7A3D18 0%, #D4713A 100%)" },
  { id: 3, label: "Forest",  gradient: "linear-gradient(135deg, #006058 0%, #00A896 100%)" },
  { id: 4, label: "Night",   gradient: "linear-gradient(135deg, #120900 0%, #3D1F00 100%)" },
];

const PHOTO_MAX_MB = 5;


type ModalType = "handle" | "photo" | "wallpaper" | "rec-request" | null;
type EditSection = "name" | "trade" | "credentials" | "bio" | "contact" | "service" | null;


// ── Section header with edit toggle ──────────────────────────────────────────
function SectionHeader({
  label,
  editing,
  onEdit,
  onDone,
}: {
  label: string;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  return (
    <Group justify="space-between" align="center">
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>{label}</Text>
      {editing ? (
        <Button size="xs" variant="light" color="blue" onClick={onDone}>Done</Button>
      ) : (
        <Tooltip label={`Edit ${label.toLowerCase()}`} withArrow>
          <ActionIcon size="xs" variant="subtle" onClick={onEdit}><IconPencil size={12} /></ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProAccountPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "public";

  const avatarSrc = useProAvatar();
  const { handle, loading: handleLoading, setHandle, profileUrl } = useProHandle({
    firstName: user?.first_name,
    lastName: user?.last_name,
  });

  // ── Name edit ──
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");

  useEffect(() => {
    if (user) {
      setFirstName((prev) => prev || user.first_name);
      setLastName((prev) => prev || user.last_name);
    }
  }, [user]);

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Your Name";
  const initials = (user?.first_name?.[0] ?? user?.email?.[0] ?? "P").toUpperCase();

  // ── Share ──
  const [copied, setCopied] = useState(false);
  function shareProfile() {
    if (!profileUrl) return;
    void navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Public page state — hydrated from backend on mount ──
  const [trade, setTrade] = useState("");
  const [bio, setBio] = useState("");
  const [responseTime, setResponseTime] = useState("4");
  const [licensed, setLicensed] = useState(false);
  const [insured, setInsured] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [serviceMode, setServiceMode] = useState<"zips" | "radius">("zips");
  const [zips, setZips] = useState<string[]>([]);
  const [zipInput, setZipInput] = useState("");
  const [centerZip, setCenterZip] = useState("");
  const [radius, setRadius] = useState(25);
  const [wallpaperId, setWallpaperId] = useState(0);
  const [wpCustomUrl, setWpCustomUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // ── Edit section state ──
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [handleEditing, setHandleEditing] = useState(false);

  // ── Krafts ──
  const [krafts, setKrafts] = useState<KraftOut[]>([]);

  // Hydrate from backend
  useEffect(() => {
    client.GET("/api/pros/me").then(({ data }) => {
      if (!data) return;
      if (data.primary_trade) setTrade(data.primary_trade);
      if (data.bio) setBio(data.bio);
      if (data.response_hours) setResponseTime(String(data.response_hours));
      setLicensed(data.licensed ?? false);
      setInsured(data.insured ?? false);
      if (data.license_number) setLicenseNumber(data.license_number);
      if (data.skill_tags?.length) setSkills(data.skill_tags);
      if (data.service_mode) setServiceMode(data.service_mode === "radial" ? "radius" : "zips");
      if (data.service_zips?.length) setZips(data.service_zips);
      if (data.service_center_zip) setCenterZip(data.service_center_zip);
      if (data.service_radius_miles) setRadius(data.service_radius_miles);
      if (data.wallpaper_id != null) setWallpaperId(data.wallpaper_id);
      if (data.wallpaper_url) { setWpCustomUrl(data.wallpaper_url); setWallpaperId(-1); }
    });

    listMyKrafts().then((ks) => {
      const sorted = [...ks].sort((a, b) => {
        const ay = a.end_year ?? a.start_year ?? 0;
        const by = b.end_year ?? b.start_year ?? 0;
        if (by !== ay) return by - ay;
        const am = a.end_month ?? a.start_month ?? 0;
        const bm = b.end_month ?? b.start_month ?? 0;
        if (bm !== am) return bm - am;
        return b.id - a.id;
      });
      setKrafts(sorted);
    }).catch(() => {});
  }, []);

  function handleTradeChange(newTrade: string) {
    setTrade(newTrade);
    setSkills((prev) => {
      const valid = TRADE_SKILLS[newTrade] ?? [];
      return prev.filter((s) => valid.includes(s));
    });
  }

  async function saveProfile() {
    setSaving(true);
    setSaveError(null);
    try {
      const nameRes = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken() ?? ""}` },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone: contactPhone || null }),
      });
      if (nameRes.ok) {
        updateUser({ first_name: firstName, last_name: lastName, phone: contactPhone || null });
      }

      const { error: proErr } = await client.PATCH("/api/pros/me", {
        body: {
          primary_trade: trade || undefined,
          bio: bio,
          response_hours: responseTime ? Number(responseTime) : undefined,
          licensed,
          insured,
          license_number: licenseNumber || undefined,
          skill_tags: skills,
          wallpaper_id: wallpaperId >= 0 ? wallpaperId : 0,
          wallpaper_url: wallpaperId === -1 ? (wpCustomUrl ?? "") : "",
        },
      });
      if (proErr) throw new Error("Failed to save profile.");

      const { error: areaErr } = await client.PATCH("/api/pros/me/service-area", {
        body: {
          service_mode: serviceMode === "radius" ? "radial" : "explicit",
          service_zips: serviceMode === "zips" ? zips : undefined,
          service_center_zip: serviceMode === "radius" ? centerZip : undefined,
          service_radius_miles: serviceMode === "radius" ? radius : undefined,
        },
      });
      if (areaErr) throw new Error("Failed to save service area.");

      setSaveSuccess(true);
      setEditSection(null);
      setHandleEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Photo state ──
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);
  const profileContentRef = useRef<HTMLDivElement>(null);
  const existingAvatar = loadAvatar();
  const liveAvatarSrc = photoPreview ?? (photoUrl.trim() || existingAvatar) ?? undefined;

  function handleFileChange(file: File | null) {
    setPhotoError(null);
    if (!file) return;
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) { setPhotoError(`Max ${PHOTO_MAX_MB} MB.`); resetRef.current?.(); return; }
    if (!file.type.startsWith("image/")) { setPhotoError("Image files only (JPEG, PNG, WebP)."); resetRef.current?.(); return; }
    setPhotoFile(file);
    setPhotoUrl("");
    fileToDataUrl(file)
      .then((d) => { setAvatarCropSrc(d); })
      .catch(() => setPhotoError("Could not read image — try another file."));
  }

  async function savePhoto(): Promise<boolean> {
    if (!photoPreview) return false;
    setPhotoError(null);
    try {
      // Compress to max 400×400 JPEG before saving — prevents oversized payloads from
      // silently failing on the backend (Django body limit ~2.5 MB).
      const compressed = await compressDataUrl(photoPreview, 400);
      saveAvatar(compressed);
      await client.PATCH("/api/pros/me", { body: { avatar_url: compressed } } as never);
      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 2000);
      return true;
    } catch {
      setPhotoError("Failed to save photo — please try again.");
      return false;
    }
  }

  function handleUrlCrop() {
    const u = photoUrl.trim();
    if (u) setAvatarCropSrc(u);
  }

  // ── Wallpaper custom upload / URL ──
  const [wpUrl, setWpUrl] = useState("");
  const [wpCropSrc, setWpCropSrc] = useState<string | null>(null);
  const wpResetRef = useRef<() => void>(null);

  async function handleWpFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setOpenModal(null);
    setWpCropSrc(dataUrl);
  }

  function applyWpUrl() {
    const u = wpUrl.trim();
    if (!u) return;
    setWpUrl("");
    setOpenModal(null);
    setWpCropSrc(u);
  }

  const bannerBg = wallpaperId === -1 && wpCustomUrl
    ? `url("${wpCustomUrl}")`
    : (WALLPAPERS[wallpaperId]?.gradient ?? "url('/brand/gigkraft-wallpaper.png')");

  // ── Contact info ──
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");

  useEffect(() => {
    if (user) {
      setContactEmail((prev) => prev || user.email || "");
      setContactPhone((prev) => prev || user.phone || "");
    }
  }, [user]);

  // ── Recommendation request ──
  const [recName, setRecName] = useState("");
  const [recContact, setRecContact] = useState("");

  // ── Handle inline edit ──
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [handleInput, setHandleInput] = useState(handle ?? "");
  const handleSanitized = sanitizeHandle(handleInput);
  const handleValid = isValidHandle(handleSanitized);
  function saveHandle() {
    if (handleValid) void setHandle(handleSanitized).then(() => { setOpenModal(null); setHandleEditing(false); });
  }

  function addZip() {
    const z = zipInput.trim();
    if (!z || zips.includes(z) || zips.length >= 3) return;
    setZips([...zips, z]);
    setZipInput("");
  }

  const recMessage = `Hi ${recName || "[Name]"}! ${displayName} is requesting a recommendation on gigKraft.com. It only takes a minute — visit gigKraft.com/review to share your experience.`;

  async function exportToPDF() {
    if (exporting) return;
    setExporting(true);
    setSaveError(null);
    try {
      const el = profileContentRef.current;
      if (!el) throw new Error("Profile content not found.");

      const canvas = await toCanvas(el, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => !(node instanceof HTMLElement && (
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

      const fileName = `${displayName.replace(/\s+/g, "-").toLowerCase()}-${(trade || "pro").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF export failed:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setExporting(false);
    }
  }

  // ── Shared profile hero (used in settings tab) ──
  const ProfileHero = (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md">
          <Avatar size={64} src={avatarSrc ?? undefined} color="blue" radius="xl">
            {!avatarSrc && initials}
          </Avatar>
          <Stack gap={2}>
            <Text fw={700} size="lg">{displayName}</Text>
            <Text size="sm" c="dimmed">{user?.email ?? user?.phone ?? "—"}</Text>
            <Badge size="sm" variant="light">Pro</Badge>
          </Stack>
        </Group>
        <Stack gap="xs" align="flex-end">
          <Button
            size="sm" variant="light"
            leftSection={<IconShare size={16} />}
            onClick={shareProfile}
            color={copied ? "green" : undefined}
            disabled={handleLoading || !profileUrl}
            loading={handleLoading}
          >
            {copied ? "Link copied!" : "Share profile"}
          </Button>
          {profileUrl && (
            <Group gap={4}>
              <Text size="xs" c="dimmed" truncate maw={180} title={profileUrl}>{profileUrl}</Text>
              <ActionIcon component={Link} to={profileUrl.replace(window.location.origin, "")} target="_blank" size="xs" variant="subtle">
                <IconExternalLink size={12} />
              </ActionIcon>
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );

  return (
    <Stack maw={860}>
      <Tabs value={activeTab} onChange={(v) => setSearchParams(v ? { tab: v } : {})} color="var(--gk-accent-primary)">
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab value="public"
            style={{ color: activeTab === "public" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="settings"
            style={{ color: activeTab === "settings" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="billing"
            leftSection={<IconCreditCard size={15} />}
            style={{ color: activeTab === "billing" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}>
            Billing
          </Tabs.Tab>
        </Tabs.List>

        {/* ══════════════════════════ PUBLIC PAGE TAB ══════════════════════════ */}
        <Tabs.Panel value="public" pt="md">
          <Stack ref={profileContentRef}>

            {/* ── Hero card — public profile layout with inline edit sections ── */}
            <Card withBorder radius="md" padding={0} style={{ overflow: "hidden" }}>
              {/* Wallpaper banner — click to open picker */}
              <div
                style={{ height: 120, backgroundImage: bannerBg, backgroundSize: "cover", backgroundPosition: "center", position: "relative", cursor: "pointer" }}
                onClick={() => setOpenModal("wallpaper")}
                onMouseEnter={(e) => {
                  const el = e.currentTarget.querySelector<HTMLElement>(".wp-hint");
                  if (el) el.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget.querySelector<HTMLElement>(".wp-hint");
                  if (el) el.style.opacity = "0";
                }}
              >
                <div className="wp-hint" style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.15s", pointerEvents: "none",
                }}>
                  <Group gap={6}>
                    <IconCamera size={20} color="#fff" />
                    <Text size="sm" fw={600} c="white">Change wallpaper</Text>
                  </Group>
                </div>
              </div>

              <div style={{ position: "relative", padding: "0 20px 20px" }}>
                {/* Avatar overlaps banner */}
                <div style={{ position: "absolute", top: -44, left: 20, cursor: "pointer" }}
                  onClick={() => setOpenModal("photo")}>
                  <Avatar size={88} src={avatarSrc ?? undefined} color="blue" radius="xl"
                    style={{ fontSize: 32, border: "3px solid var(--mantine-color-body)" }}>
                    {!avatarSrc && initials}
                  </Avatar>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 12, background: "rgba(0,0,0,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}>
                    <IconCamera size={20} color="#fff" />
                  </div>
                </div>

                {/* Name + handle row */}
                <Group justify="space-between" align="center" pt={8} pl={104} wrap="nowrap">
                  <Stack gap={2}>
                    {editSection === "name" ? (
                      <Group gap="xs" wrap="wrap" align="flex-end">
                        <TextInput size="sm" placeholder="First name" value={firstName}
                          onChange={(e) => setFirstName(e.currentTarget.value)} style={{ flex: 1, minWidth: 100 }} autoFocus />
                        <TextInput size="sm" placeholder="Last name" value={lastName}
                          onChange={(e) => setLastName(e.currentTarget.value)} style={{ flex: 1, minWidth: 100 }} />
                      </Group>
                    ) : (
                      <Group gap={6} align="center">
                        <Title order={2} style={{ lineHeight: 1.1 }}>{displayName}</Title>
                        <Tooltip label="Edit name" withArrow>
                          <ActionIcon size="xs" variant="subtle" onClick={() => setEditSection("name")}><IconPencil size={12} /></ActionIcon>
                        </Tooltip>
                      </Group>
                    )}

                    {/* Handle */}
                    {handleEditing ? (
                      <Group gap="xs" wrap="nowrap">
                        <TextInput size="xs" leftSection={<IconAt size={13} />} value={handleInput}
                          onChange={(e) => setHandleInput(e.currentTarget.value)}
                          error={handleInput && !handleValid ? true : undefined}
                          rightSection={handleValid ? <IconCheck size={13} color="green" /> : undefined}
                          w={160} autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") saveHandle(); if (e.key === "Escape") setHandleEditing(false); }} />
                        <ActionIcon size="sm" color="green" variant="light" disabled={!handleValid} onClick={saveHandle}><IconCheck size={13} /></ActionIcon>
                        <ActionIcon size="sm" variant="subtle" onClick={() => setHandleEditing(false)}><IconX size={13} /></ActionIcon>
                      </Group>
                    ) : (
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                          @{handleLoading ? "…" : (handle ?? "—")}
                        </Text>
                        <Tooltip label="Edit handle" withArrow>
                          <ActionIcon size="xs" variant="subtle" disabled={handleLoading}
                            onClick={() => { setHandleInput(handle ?? ""); setHandleEditing(true); }}>
                            <IconPencil size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    )}
                  </Stack>

                  {/* Download PDF · Save · Share */}
                  <Group gap={4}>
                    <Tooltip label={exporting ? "Generating PDF…" : "Download PDF"} withArrow>
                      <ActionIcon size="sm" variant="subtle" loading={exporting} onClick={() => void exportToPDF()}>
                        <IconDownload size={15} color="var(--gk-accent-secondary)" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={saveSuccess ? "Saved!" : "Save profile"} withArrow>
                      <ActionIcon size="sm" variant="subtle" loading={saving}
                        onClick={() => void saveProfile()}>
                        <IconDeviceFloppy size={15} color={saveSuccess ? "var(--mantine-color-green-6)" : "var(--gk-accent-primary)"} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={copied ? "Copied!" : "Share"} withArrow>
                      <ActionIcon size="sm" variant="subtle" onClick={shareProfile}
                        disabled={handleLoading || !profileUrl}>
                        <IconShare size={15} color={copied ? "var(--mantine-color-green-6)" : "var(--gk-accent-secondary)"} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                {/* 2-col equal cards: Left = Bio + Contact | Right = About */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md" style={{ alignItems: "stretch" }}>

                  {/* LEFT card — Bio + Contact */}
                  <Card withBorder radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="md" style={{ flex: 1 }}>

                      {/* Bio */}
                      <Stack gap="xs">
                        <Group justify="space-between" align="center">
                          <Text size="xs" fw={700} tt="uppercase"
                            style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Bio</Text>
                          {editSection === "bio"
                            ? <Button size="xs" variant="light" color="blue" onClick={() => setEditSection(null)}>Done</Button>
                            : <Tooltip label="Edit bio" withArrow><ActionIcon size="xs" variant="subtle" onClick={() => setEditSection("bio")}><IconPencil size={12} /></ActionIcon></Tooltip>
                          }
                        </Group>
                        {editSection === "bio" ? (
                          <Textarea placeholder="Tell homeowners about your background…"
                            minRows={3} maxRows={6} autosize maxLength={500}
                            value={bio} onChange={(e) => setBio(e.currentTarget.value)}
                            description={`${bio.length}/500`}
                            styles={{ input: { fontSize: "var(--mantine-font-size-sm)" } }} />
                        ) : (
                          bio
                            ? <Text size="sm" style={{ lineHeight: 1.7 }}>{bio}</Text>
                            : <Text size="sm" c="dimmed" fs="italic">No bio yet. Click edit to add one.</Text>
                        )}
                      </Stack>

                      <Divider style={{ borderColor: "var(--gk-border)" }} />

                      {/* Contact */}
                      <Stack gap="xs">
                        <Group justify="space-between" align="center">
                          <Text size="xs" fw={700} tt="uppercase"
                            style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Contact</Text>
                          {editSection === "contact"
                            ? <Button size="xs" variant="light" color="blue" onClick={() => setEditSection(null)}>Done</Button>
                            : <Tooltip label="Edit contact" withArrow><ActionIcon size="xs" variant="subtle" onClick={() => setEditSection("contact")}><IconPencil size={12} /></ActionIcon></Tooltip>
                          }
                        </Group>
                        {editSection === "contact" ? (
                          <Stack gap="xs">
                            <TextInput size="xs" label="Email" leftSection={<IconMail size={13} />}
                              value={contactEmail} onChange={(e) => setContactEmail(e.currentTarget.value)} />
                            <TextInput size="xs" label="Phone" leftSection={<IconMessage size={13} />}
                              value={contactPhone} onChange={(e) => setContactPhone(e.currentTarget.value)} />
                          </Stack>
                        ) : (
                          <Stack gap={4}>
                            <Group gap={6}>
                              <IconMail size={14} color="var(--gk-accent-primary)" />
                              <Text size="sm">{contactEmail || user?.email || "—"}</Text>
                            </Group>
                            <Group gap={6}>
                              <IconMessage size={14} color="var(--gk-accent-primary)" />
                              <Text size="sm">{contactPhone || user?.phone || "—"}</Text>
                            </Group>
                          </Stack>
                        )}
                      </Stack>

                    </Stack>
                  </Card>

                  {/* RIGHT card — Trade / Response / Skills (no label above) */}
                  <Card withBorder radius="md" padding="md"
                    style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)", display: "flex", flexDirection: "column" }}>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="flex-end">
                        {editSection === "trade"
                          ? <Button size="xs" variant="light" color="blue" onClick={() => setEditSection(null)}>Done</Button>
                          : <Tooltip label="Edit" withArrow><ActionIcon size="xs" variant="subtle" onClick={() => setEditSection("trade")}><IconPencil size={12} /></ActionIcon></Tooltip>
                        }
                      </Group>

                      {editSection !== "trade" ? (
                        trade || skills.length > 0 ? (
                          <Stack gap="xs">
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <Text fw={700} size="sm" style={{ color: "var(--gk-accent-primary)" }}>{trade}</Text>
                              <Text size="sm" style={{ color: "var(--gk-accent-secondary)", flexShrink: 0 }}>
                                ⚡ {responseTime}h response
                              </Text>
                            </Group>
                            {skills.length > 0 && (
                              <>
                                <Divider style={{ borderColor: "var(--gk-border)" }} />
                                <Stack gap={2}>
                                  {skills.map((s) => <Text key={s} size="sm">{s}</Text>)}
                                  {licensed && <Text size="sm" c="dimmed">Licensed{licenseNumber ? ` · ${licenseNumber}` : ""}</Text>}
                                  {insured && <Text size="sm" c="dimmed">Insured</Text>}
                                </Stack>
                              </>
                            )}
                          </Stack>
                        ) : (
                          <Text size="xs" c="dimmed" fs="italic">No trade set yet. Click edit to add.</Text>
                        )
                      ) : (
                        <Stack gap="xs">
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                            <Select size="xs" label="Primary trade" data={TRADES} value={trade || null}
                              onChange={(v) => { if (v) handleTradeChange(v); }} />
                            <Select size="xs" label="Response time" value={responseTime}
                              onChange={(v) => { if (v) setResponseTime(v); }}
                              data={[{ value: "1", label: "1h" }, { value: "2", label: "2h" }, { value: "4", label: "4h" }, { value: "8", label: "8h" }]} />
                          </SimpleGrid>
                          {trade && (
                            <div>
                              <Text size="xs" c="dimmed" mb={4}>Skills</Text>
                              <Chip.Group multiple value={skills} onChange={setSkills}>
                                <Group gap={6}>
                                  {(TRADE_SKILLS[trade] ?? []).map((s) => (
                                    <Chip key={s} value={s} size="xs">{s}</Chip>
                                  ))}
                                </Group>
                              </Chip.Group>
                            </div>
                          )}
                          <Group gap="xl">
                            <Switch size="sm" label="Licensed" checked={licensed} onChange={(e) => setLicensed(e.currentTarget.checked)} />
                            <Switch size="sm" label="Insured" checked={insured} onChange={(e) => setInsured(e.currentTarget.checked)} />
                          </Group>
                          {licensed && (
                            <TextInput size="xs" label="License number" placeholder="TX-PLB-000000" w={220}
                              value={licenseNumber} onChange={(e) => setLicenseNumber(e.currentTarget.value)} />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Card>

                </SimpleGrid>

                <Divider my="md" />

                {/* Service area */}
                <Stack gap="xs">
                  <SectionHeader label="Service area" editing={editSection === "service"}
                    onEdit={() => setEditSection("service")} onDone={() => setEditSection(null)} />
                  <Group gap="xs">
                    {serviceMode === "zips"
                      ? zips.length > 0
                        ? zips.map((z) => <Badge key={z} size="sm" variant="outline">{z}</Badge>)
                        : <Text size="xs" c="dimmed" fs="italic">No service area set.</Text>
                      : centerZip
                        ? <Badge variant="outline" size="sm">{centerZip} · {radius} mi radius</Badge>
                        : <Text size="xs" c="dimmed" fs="italic">No service area set.</Text>}
                  </Group>
                  {editSection === "service" && (
                    <Stack gap="xs" mt={4}>
                      <Group gap="xs">
                        <Button size="xs" variant={serviceMode === "zips" ? "filled" : "light"} onClick={() => setServiceMode("zips")}>ZIP codes</Button>
                        <Button size="xs" variant={serviceMode === "radius" ? "filled" : "light"} onClick={() => setServiceMode("radius")}>Radius</Button>
                      </Group>
                      {serviceMode === "zips" ? (
                        <>
                          <Group gap="xs" wrap="wrap">
                            {zips.map((z) => (
                              <Badge key={z} size="sm" variant="outline" rightSection={
                                <ActionIcon size="xs" variant="transparent" onClick={() => setZips(zips.filter((x) => x !== z))}>
                                  <IconX size={9} />
                                </ActionIcon>
                              }>{z}</Badge>
                            ))}
                          </Group>
                          {zips.length < 3 && (
                            <Group gap="xs">
                              <TextInput size="xs" placeholder="Add ZIP (max 3)" value={zipInput}
                                onChange={(e) => setZipInput(e.currentTarget.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") addZip(); }} w={160} />
                              <Button size="xs" variant="light" onClick={addZip}>Add</Button>
                            </Group>
                          )}
                        </>
                      ) : (
                        <Stack gap="xs">
                          <TextInput size="xs" label="Center ZIP" value={centerZip}
                            onChange={(e) => setCenterZip(e.currentTarget.value)} w={140} />
                          <Text size="xs" c="dimmed">Radius: <strong>{radius} mi</strong></Text>
                          <Slider min={1} max={100} value={radius} onChange={setRadius} size="sm" maw={300} />
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Stack>

                {saveError && (
                  <Alert color="red" variant="light" onClose={() => setSaveError(null)} withCloseButton mt="sm">
                    {saveError}
                  </Alert>
                )}

              </div>
            </Card>

            {/* ── Krafts ── */}
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Krafts</Title>
                <Tooltip label="Add Kraft" withArrow>
                  <ActionIcon component={Link} to="/pro/krafts/new" size="md" variant="light"
                    style={{ background: "var(--gk-brand-gradient)" }}>
                    <IconPlus size={15} color="white" />
                  </ActionIcon>
                </Tooltip>
              </Group>
              {krafts.length > 0 ? (
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
                      beforeUrl={k.photos.find((p) => p.kind === "before")?.image_url ?? null}
                      afterUrl={k.photos.find((p) => p.kind === "after")?.image_url ?? null}
                    />
                  ))}
                </Stack>
              ) : (
                <Card withBorder radius="md" padding="xl" style={{ textAlign: "center" }}>
                  <Stack align="center" gap="sm">
                    <IconPhoto size={40} color="var(--gk-accent-primary)" />
                    <Text fw={600}>No Krafts yet</Text>
                    <Text size="sm" c="dimmed">Add before/after photos of your work to build trust with homeowners.</Text>
                    <Button size="sm" leftSection={<IconPlus size={14} />} component={Link} to="/pro/krafts/new">
                      Add your first Kraft
                    </Button>
                  </Stack>
                </Card>
              )}
            </Stack>

            {/* ── Reviews ── */}
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Title order={4} style={{ color: "var(--gk-accent-primary)" }}>Reviews</Title>
                <Tooltip label="Request recommendation" withArrow>
                  <ActionIcon size="md" variant="light" onClick={() => setOpenModal("rec-request")}>
                    <IconPlus size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <ReviewsSection handle={handle} />
            </Stack>

            {/* PDF / page footer */}
            <Group
              justify="center"
              align="center"
              gap={8}
              pt="md"
              style={{ borderTop: "1px solid var(--gk-border)", opacity: 0.7 }}
            >
              <Box
                component="img"
                src="/brand/gigKraftLogo.png"
                h={28}
                w="auto"
                style={{ display: "block", objectFit: "contain" }}
              />
              <Text size="sm" style={{ color: "#000" }}>Powered by gigKraft.com</Text>
            </Group>
          </Stack>
        </Tabs.Panel>

        {/* ══════════════════════════ BILLING TAB ══════════════════════════ */}
        <Tabs.Panel value="billing" pt="md">
          <BillingTab />
        </Tabs.Panel>

        {/* ══════════════════════════ SETTINGS TAB ══════════════════════════ */}
        <Tabs.Panel value="settings" pt="md">
          <Stack>
            {ProfileHero}
            <ThemeSettingsCard />
            <Card withBorder radius="md" padding="lg">
              <Stack>
                <Title order={5}>Notifications</Title>
                <Switch label="SMS alerts for new leads" defaultChecked description="Receive a text when a homeowner contacts you" />
                <Switch label="WhatsApp dispatch alerts" defaultChecked description="Get notified via WhatsApp for emergency dispatches" />
                <Switch label="Weekly performance digest" description="A summary of your profile views and lead activity" />
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg">
              <Stack>
                <Title order={5}>Danger zone</Title>
                <Text size="sm" c="dimmed">Permanently delete your account and all associated data.</Text>
                <Button color="red" variant="light" w="fit-content">Delete account</Button>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* ══════════════════════════ MODALS ══════════════════════════ */}

      {/* Wallpaper picker modal */}
      <Modal opened={openModal === "wallpaper"} onClose={() => setOpenModal(null)} title="Change wallpaper" size="md">
        <Stack gap="md">
          <Text size="xs" c="dimmed">Pick a gradient, upload an image, or paste a URL.</Text>
          <SimpleGrid cols={3} spacing="sm">
            {WALLPAPERS.map((w) => (
              <div
                key={w.id}
                onClick={() => { setWallpaperId(w.id); setWpCustomUrl(null); setOpenModal(null); }}
                style={{
                  height: 80, borderRadius: 10, cursor: "pointer",
                  background: w.gradient,
                  border: wallpaperId === w.id ? "3px solid var(--mantine-color-blue-5)" : "3px solid transparent",
                  boxShadow: wallpaperId === w.id ? "0 0 0 2px var(--mantine-color-blue-3)" : undefined,
                  position: "relative", transition: "border 0.12s",
                }}
              >
                {wallpaperId === w.id && (
                  <div style={{ position: "absolute", top: 6, right: 6 }}>
                    <IconCheck size={16} color="#fff" />
                  </div>
                )}
                <Text size="xs" fw={600} c="white" style={{ position: "absolute", bottom: 6, left: 8 }}>{w.label}</Text>
              </div>
            ))}
          </SimpleGrid>
          <Stack gap="xs">
            <FileButton resetRef={wpResetRef} onChange={handleWpFile} accept="image/jpeg,image/png,image/webp">
              {(props) => (
                <Button {...props} size="xs" variant="light" leftSection={<IconUpload size={14} />} fullWidth>
                  Upload image from device
                </Button>
              )}
            </FileButton>
            <Group gap="xs">
              <TextInput size="xs" placeholder="Paste image URL" value={wpUrl}
                onChange={(e) => setWpUrl(e.currentTarget.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyWpUrl(); }}
                style={{ flex: 1 }} />
              <Button size="xs" variant="default" onClick={applyWpUrl} disabled={!wpUrl.trim()}>Use</Button>
            </Group>
          </Stack>
        </Stack>
      </Modal>

      {/* Recommendation request modal */}
      <Modal opened={openModal === "rec-request"} onClose={() => setOpenModal(null)} title="Request a recommendation" size="md">
        <Stack>
          <Text size="sm" c="dimmed">
            Enter your customer's name and contact info. We'll prepare a message you can send via email or text.
          </Text>
          <SimpleGrid cols={2} spacing="sm">
            <TextInput label="Customer first name" placeholder="Jane" value={recName}
              onChange={(e) => setRecName(e.currentTarget.value)} />
            <TextInput label="Email or phone" placeholder="jane@email.com or +1 512 555 0100" value={recContact}
              onChange={(e) => setRecContact(e.currentTarget.value)} />
          </SimpleGrid>
          <Stack gap={4}>
            <Text size="xs" fw={500} c="dimmed">Message preview</Text>
            <Card withBorder radius="md" padding="sm" style={{ background: "var(--gk-bg-surface)" }}>
              <Text size="sm">{recMessage}</Text>
            </Card>
          </Stack>
          <Group gap="sm">
            <CopyButton value={recMessage}>
              {({ copied, copy }) => (
                <Button variant="light" leftSection={<IconCopy size={15} />} onClick={copy} color={copied ? "green" : undefined} style={{ flex: 1 }}>
                  {copied ? "Copied!" : "Copy message"}
                </Button>
              )}
            </CopyButton>
            <Button variant="light" color="blue" leftSection={<IconMail size={15} />} style={{ flex: 1 }}
              component="a" href={`mailto:${recContact}?subject=Recommendation request on gigKraft.com&body=${encodeURIComponent(recMessage)}`} target="_blank">
              Send email
            </Button>
            <Button variant="light" color="green" leftSection={<IconMessage size={15} />} style={{ flex: 1 }}
              component="a" href={`sms:${recContact}?body=${encodeURIComponent(recMessage)}`}>
              Send text
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={openModal === "handle"} onClose={() => setOpenModal(null)} title="Edit your handle" size="sm">
        <Stack>
          <Text size="sm" c="dimmed">Your handle is your public profile URL. Letters, numbers, and hyphens only.</Text>
          <TextInput
            leftSection={<IconAt size={16} />} placeholder="john-smith"
            value={handleInput} onChange={(e) => setHandleInput(e.currentTarget.value)}
            description={handleInput ? `gigKraft.com/pros/${handleSanitized}` : "3–30 characters"}
            error={handleInput && !handleValid ? "Must be 3–30 characters, letters/numbers/hyphens only" : undefined}
            rightSection={handleValid ? <IconCheck size={16} color="green" /> : undefined}
          />
          {handleValid && handle && handleSanitized !== handle && (
            <Alert color="yellow" variant="light">
              URL will change from <Code>/pros/{handle}</Code> to <Code>/pros/{handleSanitized}</Code>. Old links will stop working.
            </Alert>
          )}
          <Button onClick={saveHandle} disabled={!handleValid || handleSanitized === (handle ?? "")}>Save handle</Button>
        </Stack>
      </Modal>

      <Modal opened={openModal === "photo"} onClose={() => { setOpenModal(null); setPhotoError(null); }} title="Profile photo" size="sm">
        <Stack>
          <Group align="flex-start" gap="lg">
            <Stack align="center" gap="xs">
              <Avatar src={liveAvatarSrc} size={80} radius="xl" color="blue">{!liveAvatarSrc && initials}</Avatar>
              {(photoPreview || existingAvatar) && (
                <Button size="xs" variant="subtle" color="red" onClick={() => {
                  setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(""); setPhotoError(null);
                  setAvatarCropSrc(null); resetRef.current?.(); clearAvatar();
                }}>Remove</Button>
              )}
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <FileButton resetRef={resetRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp">
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconUpload size={16} />} fullWidth>
                    Upload from device
                  </Button>
                )}
              </FileButton>
              <Stack gap={2}>
                <Text size="xs" c="dimmed"><strong>Recommended:</strong> 400×400 px or larger, square crop</Text>
                <Text size="xs" c="dimmed"><strong>Max:</strong> {PHOTO_MAX_MB} MB · JPEG, PNG, WebP</Text>
              </Stack>
              {photoError && <Text size="xs" c="red">{photoError}</Text>}
              {photoFile && !photoPreview && <Text size="xs" c="dimmed">Loading…</Text>}
              {photoPreview && <Text size="xs" c="green">✓ Photo cropped and ready</Text>}
            </Stack>
          </Group>
          <Group gap="xs">
            <TextInput
              label="Or paste a photo URL"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => { setPhotoUrl(e.currentTarget.value); if (e.currentTarget.value) { setPhotoFile(null); setPhotoPreview(null); resetRef.current?.(); } }}
              leftSection={<IconCamera size={16} />}
              description="Paste then click 'Crop URL'"
              style={{ flex: 1 }}
            />
            <Button size="sm" variant="light" mt={22} onClick={handleUrlCrop} disabled={!photoUrl.trim()}>
              Crop URL
            </Button>
          </Group>
          <Group justify="flex-end">
            <Button
              size="sm"
              onClick={async () => { const ok = await savePhoto(); if (ok) setOpenModal(null); }}
              color={photoSaved ? "green" : undefined}
              disabled={!photoPreview}
            >
              {photoSaved ? "Saved!" : "Save photo"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Avatar crop modal */}
      {avatarCropSrc && (
        <ImageCropModal
          opened={Boolean(avatarCropSrc)}
          src={avatarCropSrc}
          aspect={1}
          circularCrop
          title="Crop profile photo"
          onConfirm={(dataUrl) => {
            setPhotoPreview(dataUrl);
            setAvatarCropSrc(null);
          }}
          onCancel={() => {
            setAvatarCropSrc(null);
            setPhotoFile(null);
            resetRef.current?.();
          }}
        />
      )}

      {/* Wallpaper crop modal */}
      {wpCropSrc && (
        <ImageCropModal
          opened={Boolean(wpCropSrc)}
          src={wpCropSrc}
          aspect={860 / 120}
          title="Crop wallpaper"
          onConfirm={(dataUrl) => {
            setWpCustomUrl(dataUrl);
            setWallpaperId(-1);
            setWpCropSrc(null);
          }}
          onCancel={() => {
            setWpCropSrc(null);
            wpResetRef.current?.();
          }}
        />
      )}
    </Stack>
  );
}
