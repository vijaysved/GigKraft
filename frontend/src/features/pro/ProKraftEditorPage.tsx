import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  FileButton,
  Group,
  Loader,
  Center,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import {
  IconCheck,
  IconExternalLink,
  IconEye,
  IconPencil,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { ImageCropModal } from "../../components/ImageCropModal";
import { KraftCard } from "../../components/KraftCard";
import {
  createKraft,
  getKraftBySlug,
  getMyProProfile,
  publishKraft,
  updateKraft,
  type KraftOut,
} from "../../api/endpoints";
import { useProHandle } from "../../hooks/useProHandle";
import { compressKraftPhoto } from "../../hooks/useProAvatar";

// ── Constants ─────────────────────────────────────────────────────────────────
const GIG_TYPES = [
  { value: "under_500", label: "Under $500" },
  { value: "500_2000",  label: "$500 – $2,000" },
  { value: "2000_plus", label: "$2,000 or more" },
];

const MONTHS = [
  { value: "1",  label: "January" },
  { value: "2",  label: "February" },
  { value: "3",  label: "March" },
  { value: "4",  label: "April" },
  { value: "5",  label: "May" },
  { value: "6",  label: "June" },
  { value: "7",  label: "July" },
  { value: "8",  label: "August" },
  { value: "9",  label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const NOW        = new Date();
const THIS_MONTH = String(NOW.getMonth() + 1);
const THIS_YEAR  = String(NOW.getFullYear());
const YEARS      = Array.from({ length: 11 }, (_, i) => String(NOW.getFullYear() - i));
const DESC_MAX   = 1024;
const PHOTO_MAX_MB = 10;

// ── PhotoSlot ─────────────────────────────────────────────────────────────────
interface PhotoSlot {
  src: string | null;
  file: File | null;
}

function PhotoCard({
  label, slot, onChange, onClear, required,
}: {
  label: string; slot: PhotoSlot;
  onChange: (s: PhotoSlot) => void; onClear: () => void; required?: boolean;
}) {
  const resetRef = useRef<() => void>(null);
  const [urlInput,  setUrlInput]  = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [cropSrc,   setCropSrc]   = useState<string | null>(null);

  async function handleFile(file: File | null) {
    setError(null);
    if (!file) return;
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) { setError(`Max ${PHOTO_MAX_MB} MB`); resetRef.current?.(); return; }
    if (!file.type.startsWith("image/"))          { setError("Image files only");        resetRef.current?.(); return; }
    const raw = await compressKraftPhoto(file);
    setCropSrc(raw);
  }

  function handleUrl() {
    const u = urlInput.trim();
    if (u) setCropSrc(u);
  }

  return (
    <>
      <Card withBorder radius="md" padding="md" style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)" }}>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" fw={600}>{label}{required && <Text span c="red"> *</Text>}</Text>
            {slot.src && (
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => { onClear(); setUrlInput(""); setError(null); }}>
                <IconX size={13} />
              </ActionIcon>
            )}
          </Group>
          <div
            style={{ width: "100%", height: 160, borderRadius: 10, overflow: "hidden", background: "var(--gk-bg-canvas)", border: "1px solid var(--gk-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: slot.src ? "pointer" : "default" }}
            onClick={() => { if (slot.src) setCropSrc(slot.src); }}
            title={slot.src ? "Click to re-crop" : undefined}
          >
            {slot.src
              ? <img src={slot.src} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <Stack align="center" gap={4}><IconPhoto size={32} color="var(--gk-accent-primary)" /><Text size="xs" c="dimmed">No photo</Text></Stack>}
          </div>
          {slot.src && (
            <Button size="xs" variant="subtle" leftSection={<IconPencil size={13} />} onClick={() => setCropSrc(slot.src!)}>
              Re-crop / reposition
            </Button>
          )}
          <FileButton resetRef={resetRef} onChange={handleFile} accept="image/jpeg,image/png,image/webp">
            {(props) => <Button {...props} size="xs" variant="light" leftSection={<IconUpload size={14} />} fullWidth>Upload from device</Button>}
          </FileButton>
          <Group gap="xs">
            <TextInput size="xs" placeholder="or paste URL" value={urlInput} onChange={(e) => setUrlInput(e.currentTarget.value)} onKeyDown={(e) => { if (e.key === "Enter") handleUrl(); }} style={{ flex: 1 }} />
            <Button size="xs" variant="default" onClick={handleUrl} disabled={!urlInput.trim()}>Crop URL</Button>
          </Group>
          {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
      </Card>

      {cropSrc && (
        <ImageCropModal
          opened={Boolean(cropSrc)}
          src={cropSrc}
          title={`Crop — ${label}`}
          allowSkip
          onConfirm={(dataUrl) => {
            onChange({ src: dataUrl, file: null });
            setCropSrc(null);
            setUrlInput("");
            setError(null);
          }}
          onCancel={() => {
            setCropSrc(null);
            resetRef.current?.();
          }}
        />
      )}
    </>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export function ProKraftEditorPage() {
  const { id: routeSlug } = useParams();
  const navigate   = useNavigate();
  useAuth();

  const isNew = !routeSlug;

  // Backend refs
  const [backendId, setBackendId] = useState<number | null>(null);
  const [slug,      setSlug]      = useState<string | null>(routeSlug ?? null);

  // Loading states
  const [loadingKraft,   setLoadingKraft]   = useState(Boolean(routeSlug));
  const [saving,         setSaving]         = useState(false);
  const [publishing,     setPublishing]     = useState(false);
  const [saveStatus,     setSaveStatus]     = useState<"idle" | "saved" | "error">("idle");
  const [saveMsg,        setSaveMsg]        = useState("");

  // Form fields — defaults to current month/year
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [skill,       setSkill]       = useState<string | null>(null);
  const [gigType,     setGigType]     = useState<string | null>(null);
  const [location,    setLocation]    = useState("");
  const [startMonth,  setStartMonth]  = useState<string | null>(THIS_MONTH);
  const [startYear,   setStartYear]   = useState<string | null>(THIS_YEAR);
  const [endMonth,    setEndMonth]    = useState<string | null>(THIS_MONTH);
  const [endYear,     setEndYear]     = useState<string | null>(THIS_YEAR);
  const [hasBefore,   setHasBefore]   = useState(true);
  const [before,      setBefore]      = useState<PhotoSlot>({ src: null, file: null });
  const [after,       setAfter]       = useState<PhotoSlot>({ src: null, file: null });
  const [,            setStatus]      = useState<"draft" | "published">("draft");

  const [proSkills, setProSkills] = useState<string[]>([]);
  const [kraftTab, setKraftTab] = useState("edit");

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "What was done, what was the challenge, materials used…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
    ],
    content: "",
    onUpdate: ({ editor: ed }) => {
      setDescription(ed.getHTML());
    },
  });
  // Keep ref in sync so the kraft-load effect can call setContent
  useEffect(() => {
    (editorRef as React.MutableRefObject<typeof editor>).current = editor;
  }, [editor]);

  const descTextLen = editor?.getText().length ?? 0;

  // Load pro profile → skills; only default location for new krafts to avoid race with kraft load
  useEffect(() => {
    getMyProProfile().then((p) => {
      setProSkills(p.skill_tags ?? []);
      if (!routeSlug) setLocation(p.base_zip ?? "");
    }).catch(() => {});
  }, [routeSlug]);

  // Load existing Kraft when editing
  useEffect(() => {
    if (!routeSlug) return;
    setLoadingKraft(true);
    getKraftBySlug(routeSlug)
      .then((k: KraftOut) => {
        setBackendId(k.id);
        setTitle(k.title);
        setDescription(k.description);
        setSkill(k.skill || null);
        setGigType(k.gig_type || null);
        setLocation(k.location);
        setStartMonth(k.start_month ? String(k.start_month) : null);
        setStartYear( k.start_year  ? String(k.start_year)  : null);
        setEndMonth(  k.end_month   ? String(k.end_month)   : null);
        setEndYear(   k.end_year    ? String(k.end_year)    : null);
        const bp = k.photos.find((p) => p.kind === "before");
        const ap = k.photos.find((p) => p.kind === "after");
        if (bp) { setBefore({ src: bp.image_url, file: null }); setHasBefore(true); }
        else      setHasBefore(false);
        if (ap)   setAfter({ src: ap.image_url, file: null });
        setStatus(k.status === "verified" ? "published" : "draft");
        editorRef.current?.commands.setContent(k.description || "");
      })
      .catch((e: unknown) => {
        setSaveStatus("error");
        setSaveMsg(e instanceof Error ? e.message : "Failed to load Kraft.");
      })
      .finally(() => setLoadingKraft(false));
  }, [routeSlug]);

  const canPublish = Boolean(title && after.src);

  function buildPhotos() {
    const photos: { kind: "before" | "after"; image_url: string; order: number }[] = [];
    if (hasBefore && before.src) photos.push({ kind: "before", image_url: before.src, order: 0 });
    if (after.src)                photos.push({ kind: "after",  image_url: after.src,  order: 0 });
    return photos;
  }

  function buildPayload() {
    return {
      title,
      description,
      skill:       skill    ?? "",
      gig_type:    gigType  ?? "",
      location,
      start_month: startMonth ? Number(startMonth) : null,
      start_year:  startYear  ? Number(startYear)  : null,
      end_month:   endMonth   ? Number(endMonth)   : null,
      end_year:    endYear    ? Number(endYear)    : null,
      photos: buildPhotos(),
    };
  }

  async function doSave(newStatus: "draft" | "published") {
    setSaveStatus("idle");
    setSaveMsg("");
    if (newStatus === "draft") setSaving(true);
    else                       setPublishing(true);

    try {
      let kraft: KraftOut;

      if (backendId === null) {
        kraft = await createKraft(buildPayload());
        setBackendId(kraft.id);
        setSlug(kraft.slug);
        // Replace URL with slug without re-mounting the component
        navigate(`/pro/krafts/${kraft.slug}`, { replace: true });
      } else {
        kraft = await updateKraft(backendId, buildPayload());
      }

      if (newStatus === "published") {
        await publishKraft(kraft.id);
        setStatus("published");
        setSaveStatus("saved");
        setSaveMsg("Kraft published — visible on your public profile.");
      } else {
        setStatus("draft");
        setSaveStatus("saved");
        setSaveMsg("Draft saved.");
      }
    } catch (e: unknown) {
      setSaveStatus("error");
      setSaveMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }


  const skillOptions = proSkills.map((s) => ({ value: s, label: s }));

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loadingKraft) {
    return <Center py="xl"><Loader /></Center>;
  }

  return (
    <Stack maw={860}>
      {/* Page header */}
      <Title order={3} style={{ color: "var(--gk-accent-primary)" }}>{isNew ? "New Kraft" : "Edit Kraft"}</Title>

      <Tabs value={kraftTab} onChange={(v) => v && setKraftTab(v)} color="var(--gk-accent-primary)">
        <Tabs.List style={{ borderColor: "var(--gk-accent-primary)", borderBottomWidth: 2 }}>
          <Tabs.Tab
            value="edit"
            leftSection={<IconPencil size={14} color={kraftTab === "edit" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)"} />}
            style={{ color: kraftTab === "edit" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}
          >Edit</Tabs.Tab>
          <Tabs.Tab
            value="preview"
            leftSection={<IconEye size={14} color={kraftTab === "preview" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)"} />}
            style={{ color: kraftTab === "preview" ? "var(--gk-accent-primary)" : "var(--gk-accent-secondary)" }}
          >Preview</Tabs.Tab>
        </Tabs.List>

        {/* ── EDIT TAB ── */}
        <Tabs.Panel value="edit" pt="md">
          <Stack>
            {!canPublish && (
              <Alert color="blue" variant="light" radius="md">Add a title and a photo to publish.</Alert>
            )}

            {/* Job details */}
            <Card withBorder radius="md" padding="lg" style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)" }}>
              <Stack>
                <Text size="xs" fw={700} tt="uppercase" style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Job details</Text>

                <TextInput label="Title" placeholder="e.g. Kitchen faucet replacement" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />

                <Group grow gap="md">
                  <Select
                    label="Skill"
                    placeholder={proSkills.length === 0 ? "Set skills in your profile first" : "Select skill"}
                    data={skillOptions}
                    value={skill}
                    onChange={setSkill}
                    disabled={proSkills.length === 0}
                  />
                  <Select label="Gig type" placeholder="Select range" data={GIG_TYPES} value={gigType} onChange={setGigType} />
                </Group>

                <TextInput label="Location" placeholder="e.g. Austin, TX" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />

                <Group grow gap="md" align="flex-end">
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Start date</Text>
                    <Group gap="xs" grow>
                      <Select placeholder="Month" data={MONTHS} value={startMonth} onChange={setStartMonth} size="sm" />
                      <Select placeholder="Year"  data={YEARS}  value={startYear}  onChange={setStartYear}  size="sm" />
                    </Group>
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>End date</Text>
                    <Group gap="xs" grow>
                      <Select placeholder="Month" data={MONTHS} value={endMonth} onChange={setEndMonth} size="sm" />
                      <Select placeholder="Year"  data={YEARS}  value={endYear}  onChange={setEndYear}  size="sm" />
                    </Group>
                  </Stack>
                </Group>

                <Stack gap={4}>
                  <Text size="sm" fw={500}>Description</Text>
                  <Box style={{ border: "1px solid var(--gk-border)", borderRadius: 6, overflow: "hidden" }}>
                    <RichTextEditor editor={editor}>
                      <RichTextEditor.Toolbar sticky stickyOffset={0}>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.H1 />
                          <RichTextEditor.H2 />
                          <RichTextEditor.H3 />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Bold />
                          <RichTextEditor.Italic />
                          <RichTextEditor.Underline />
                          <RichTextEditor.Strikethrough />
                          <RichTextEditor.Highlight />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.AlignLeft />
                          <RichTextEditor.AlignCenter />
                          <RichTextEditor.AlignRight />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.BulletList />
                          <RichTextEditor.OrderedList />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Blockquote />
                          <RichTextEditor.Hr />
                          <RichTextEditor.ClearFormatting />
                        </RichTextEditor.ControlsGroup>
                      </RichTextEditor.Toolbar>
                      <RichTextEditor.Content />
                    </RichTextEditor>
                  </Box>
                  <Text size="xs" c={descTextLen > DESC_MAX ? "red" : "dimmed"} ta="right">
                    {descTextLen} / {DESC_MAX}{descTextLen > DESC_MAX ? " — please shorten your description" : ""}
                  </Text>
                </Stack>
              </Stack>
            </Card>

            {/* Photos */}
            <Card withBorder radius="md" padding="lg" style={{ borderColor: "var(--gk-border)", background: "var(--gk-bg-surface)" }}>
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} tt="uppercase" style={{ color: "var(--gk-accent-primary)", letterSpacing: "0.07em" }}>Photos</Text>
                  <Switch label="I have a before photo" checked={hasBefore} onChange={(e) => { setHasBefore(e.currentTarget.checked); if (!e.currentTarget.checked) setBefore({ src: null, file: null }); }} size="sm" />
                </Group>
                {hasBefore ? (
                  <Group grow gap="md" align="flex-start">
                    <PhotoCard label="Before photo" slot={before} onChange={setBefore} onClear={() => setBefore({ src: null, file: null })} />
                    <PhotoCard label="After photo"  slot={after}  onChange={setAfter}  onClear={() => setAfter({ src: null, file: null })} required />
                  </Group>
                ) : (
                  <PhotoCard label="Photo" slot={after} onChange={setAfter} onClear={() => setAfter({ src: null, file: null })} required />
                )}
              </Stack>
            </Card>

            {/* Actions + save status */}
            <Stack gap="xs">
              <Group justify="flex-end" gap="sm">
                <Button variant="default" loading={saving} onClick={() => doSave("draft")}>
                  {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button
                  disabled={!canPublish}
                  loading={publishing}
                  onClick={() => doSave("published")}
                  style={canPublish ? { background: "var(--gk-brand-gradient)" } : undefined}
                >
                  {publishing ? "Publishing…" : "Publish Kraft"}
                </Button>
              </Group>

              {saveStatus === "saved" && (
                <Alert
                  color="green"
                  variant="light"
                  radius="md"
                  icon={<IconCheck size={16} />}
                  withCloseButton
                  onClose={() => setSaveStatus("idle")}
                >
                  {saveMsg}
                </Alert>
              )}
              {saveStatus === "error" && (
                <Alert
                  color="red"
                  variant="light"
                  radius="md"
                  icon={<IconX size={16} />}
                  withCloseButton
                  onClose={() => setSaveStatus("idle")}
                >
                  {saveMsg}
                </Alert>
              )}
            </Stack>
          </Stack>
        </Tabs.Panel>

        {/* ── PREVIEW TAB ── */}
        <Tabs.Panel value="preview" pt="md">
          <Stack gap="sm">
            {slug && (
              <Group justify="flex-end">
                <Button component={Link} to={`/pro/krafts/${slug}/preview`} target="_blank" size="xs" variant="light" rightSection={<IconExternalLink size={13} />}>
                  Open in new tab
                </Button>
              </Group>
            )}
            <KraftCard
              title={title}
              skill={skill}
              gigType={gigType}
              description={description}
              location={location}
              startMonth={startMonth ? Number(startMonth) : null}
              startYear={startYear ? Number(startYear) : null}
              endMonth={endMonth ? Number(endMonth) : null}
              endYear={endYear ? Number(endYear) : null}
              beforeUrl={hasBefore ? before.src : null}
              afterUrl={after.src}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// ── Standalone public preview page ───────────────────────────────────────────
export function KraftPublicPreviewPage() {
  const { id: slug } = useParams();
  const { user }     = useAuth();
  const { handle }   = useProHandle({ firstName: user?.first_name, lastName: user?.last_name });

  const [kraft,   setKraft]   = useState<KraftOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getKraftBySlug(slug)
      .then(setKraft)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Kraft not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const before = kraft?.photos.find((p) => p.kind === "before") ?? null;
  const after  = kraft?.photos.find((p) => p.kind === "after")  ?? null;

  return (
    <Stack maw={680} mx="auto" p="md">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={4}>Kraft preview</Title>
          <Text size="xs" c="dimmed">This is how this Kraft appears on your public profile.</Text>
        </Stack>
        <Group gap="xs">
          <Button component={Link} to={`/pro/krafts/${slug}`} size="xs" variant="light" leftSection={<IconPencil size={13} />}>Back to edit</Button>
          {handle && (
            <Button component={Link} to={`/pros/${handle}`} size="xs" variant="subtle" rightSection={<IconExternalLink size={13} />}>View full profile</Button>
          )}
        </Group>
      </Group>

      {loading && <Center py="xl"><Loader /></Center>}
      {error   && <Alert color="red" variant="light">{error}</Alert>}

      {kraft && (
        <KraftCard
          title={kraft.title}
          skill={kraft.skill || null}
          gigType={kraft.gig_type || null}
          description={kraft.description}
          location={kraft.location}
          startMonth={kraft.start_month ?? null}
          startYear={kraft.start_year ?? null}
          endMonth={kraft.end_month ?? null}
          endYear={kraft.end_year ?? null}
          beforeUrl={before?.image_url ?? null}
          afterUrl={after?.image_url ?? null}
        />
      )}
    </Stack>
  );
}
