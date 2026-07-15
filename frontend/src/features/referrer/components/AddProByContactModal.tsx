import {
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconMailForward,
  IconSearch,
  IconUserCheck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  getReferrerMe,
  lookupReferrerPro,
  addReferrerPro,
  type FoundProOut,
} from "../../../api/endpoints";
import { useAuth } from "../../../auth/AuthContext";
import { InviteWizardModal } from "./InviteWizardModal";
import { nativeBtn } from "./inviteShared";

const TRADE_OPTIONS = [
  "Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Carpentry",
  "Flooring", "Landscaping", "General Contractor", "Cleaning", "Moving",
  "Pest Control", "Masonry", "Drywall", "Tile", "Other",
];

type FoundPro = FoundProOut;

type Step = "form" | "found" | "not_found" | "result";

interface ResultState {
  kind: "added" | "invited" | "already_on_list" | "exists_not_pro" | "error";
  title: string;
  body: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  onAdded: () => void;
}

function validateName(v: string): string | null {
  if (!v.trim()) return "Name is required.";
  if (v.trim().length < 2) return "Name must be at least 2 characters.";
  if (!/^[a-zA-Z\s'.-]+$/.test(v.trim()))
    return "Name may only contain letters, spaces, hyphens, and apostrophes.";
  return null;
}

function validatePhone(v: string): string | null {
  if (!v.trim()) return null;
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) return "Enter a valid phone number (min 10 digits).";
  return null;
}

function validateEmail(v: string): string | null {
  if (!v.trim()) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
    return "Enter a valid email address.";
  return null;
}

const LABEL_W = 48;

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <Text
        size="sm"
        fw={500}
        style={{ width: LABEL_W, flexShrink: 0, textAlign: "right", paddingTop: 6 }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--mantine-color-red-6)", marginLeft: 2 }}>*</span>
        )}
      </Text>
      <div style={{ flex: 1 }}>{children}</div>
    </Group>
  );
}

export function AddProByContactModal({ opened, onClose, onAdded }: Props) {
  const { user } = useAuth();
  const senderName = user?.first_name || "";

  // ── Form fields ──
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [trade, setTrade] = useState("");
  const [zip, setZip] = useState("");
  const [tradeAutoFilled, setTradeAutoFilled] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // ── Step state ──
  const [step, setStep] = useState<Step>("form");
  const [foundPro, setFoundPro] = useState<FoundPro | null>(null);
  const [searching, setSearching] = useState(false);
  const [acting, setActing] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  // ── Referrer slug (needed by the invite wizard for link-building) + default zip ──
  const [slug, setSlug] = useState("");
  useEffect(() => {
    if (!opened) return;
    getReferrerMe()
      .then((data) => {
        if (data.profile.default_zip) setZip(data.profile.default_zip);
        setSlug(data.profile.slug);
      })
      .catch(() => {});
  }, [opened]);

  // ── Not on platform — hand off to the real Invite-a-Pro wizard (channel + message + send) ──
  const [wizardOpen, setWizardOpen] = useState(false);

  function openWizard() {
    setWizardOpen(true);
  }

  function handleWizardSent() {
    onAdded();
  }

  function handleWizardClose() {
    setWizardOpen(false);
    handleClose();
  }

  async function tryAutoFillTrade(p: string, e: string) {
    if (!p.trim() && !e.trim()) return;
    try {
      const pro = await lookupReferrerPro({ phone: p.trim() || undefined, email: e.trim() || undefined });
      if (pro?.trade) { setTrade(pro.trade); setTradeAutoFilled(true); }
    } catch { /* silent */ }
  }

  function reset() {
    setName(""); setPhone(""); setEmail(""); setTrade(""); setZip("");
    setTradeAutoFilled(false);
    setNameError(null); setPhoneError(null); setEmailError(null);
    setStep("form"); setFoundPro(null); setResult(null);
  }

  function handleClose() { reset(); onClose(); }
  function backToForm() { setStep("form"); setFoundPro(null); }

  // ── Step 1: Search ──
  async function handleSearch() {
    const ne = validateName(name);
    const pe = validatePhone(phone);
    const ee = validateEmail(email);
    setNameError(ne); setPhoneError(pe); setEmailError(ee);
    if (ne || pe || ee) return;

    if (!phone.trim() && !email.trim()) {
      setPhoneError("Phone or email is required.");
      setEmailError("Phone or email is required.");
      return;
    }

    setSearching(true);
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const pro = await lookupReferrerPro({
        phone: digitsOnly || undefined,
        email: email.trim() || undefined,
      });
      if (pro) { setFoundPro(pro); setStep("found"); }
      else { setFoundPro(null); setStep("not_found"); }
    } catch {
      setFoundPro(null);
      setStep("not_found");
    } finally {
      setSearching(false);
    }
  }

  // ── Step 2: Add to list — found-on-platform pros are added directly (and notified
  // via their inbox, server-side); everyone else hands off to the invite wizard. ──
  async function handleAdd() {
    if (!foundPro) return;
    if (!foundPro.is_pro) {
      openWizard();
      return;
    }
    setActing(true);
    try {
      const res = await addReferrerPro(foundPro.handle);
      if (res.ok) {
        onAdded();
        setResult({ kind: "added", title: "Added!", body: `${foundPro.name} has been added to your list — they'll see it in their GigKraft inbox.` });
      } else if (res.status === 409) {
        setResult({ kind: "already_on_list", title: "Already on your list", body: `${foundPro.name} is already on your list.` });
      } else {
        setResult({ kind: "error", title: "Couldn't add", body: res.detail ?? "Something went wrong." });
      }
    } catch (e) {
      setResult({ kind: "error", title: "Something went wrong", body: e instanceof Error ? e.message : "Please try again." });
    } finally {
      setActing(false);
      setStep("result");
    }
  }

  // ── Render ──
  function renderContent() {
    // Result screen
    if (step === "result" && result) {
      const isError = result.kind === "error";
      const isInfo = result.kind === "already_on_list" || result.kind === "exists_not_pro";
      const color = isError ? "red" : isInfo ? "blue" : "teal";
      const Icon = isError ? IconAlertTriangle : result.kind === "invited" ? IconMailForward : IconCheck;

      return (
        <Stack gap="lg" py="xs">
          <Alert
            color={color}
            variant="light"
            icon={<Icon size={18} />}
            title={result.title}
            styles={{ title: { fontSize: 15, fontWeight: 700 } }}
          >
            <Text size="sm" mt={4}>{result.body}</Text>
          </Alert>
          <Group justify="center">
            <button style={nativeBtn({ primary: !isError })} onClick={handleClose}>OK</button>
          </Group>
        </Stack>
      );
    }

    // Found screen — unified card, one action regardless of pro/member
    if (step === "found" && foundPro) {
      return (
        <Stack gap="md" py="xs">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
            Found on GigKraft
          </Text>

          {/* Member card — same style always */}
          <div style={{
            borderRadius: 12,
            padding: 3,
            background: "var(--gk-brand-gradient)",
            boxShadow: "0 4px 16px color-mix(in srgb, var(--gk-accent-primary) 18%, transparent)",
          }}>
            <div style={{ borderRadius: 10, background: "var(--gk-bg-surface)", padding: "12px 14px" }}>
              <Group gap="md" align="center" wrap="nowrap">
                <Avatar
                  src={foundPro.avatar_url || undefined}
                  size={56}
                  radius="md"
                  color="teal"
                  style={{ border: "2px solid var(--gk-border)", flexShrink: 0 }}
                >
                  {(!foundPro.avatar_url && foundPro.name[0]?.toUpperCase()) || "?"}
                </Avatar>
                <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} align="center" wrap="nowrap">
                    <Text fw={700} size="sm" truncate>{foundPro.name}</Text>
                    {foundPro.is_verified && (
                      <Badge size="xs" color="teal" variant="light" style={{ flexShrink: 0 }}>Verified</Badge>
                    )}
                  </Group>
                  {foundPro.trade ? (
                    <Text size="xs" c="dimmed">{foundPro.trade}{foundPro.city ? ` · ${foundPro.city}` : ""}</Text>
                  ) : (
                    <Text size="xs" c="dimmed">{phone.trim() || email.trim()}</Text>
                  )}
                </Stack>
                <IconUserCheck size={20} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
              </Group>
            </div>
          </div>

          <Text size="sm" c="dimmed">
            Add <strong>{foundPro.name}</strong> to your list?
          </Text>

          <Group gap="xs">
            <Button
              flex={1}
              radius="xl"
              loading={acting}
              onClick={() => void handleAdd()}
              style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}
              leftSection={<IconUserCheck size={15} color="#fff" />}
            >
              Add to My List
            </Button>
            <button style={nativeBtn({ disabled: acting })} onClick={backToForm} disabled={acting}>
              Cancel
            </button>
          </Group>
        </Stack>
      );
    }

    // Not found screen — confirm invite
    if (step === "not_found") {
      return (
        <Stack gap="md" py="xs">
          <Alert
            color="orange"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
            title="Not found on GigKraft"
          >
            <Text size="sm">
              No account found for <strong>{phone.replace(/\D/g, "") || email.trim() || name.trim() || "this contact"}</strong>.
            </Text>
          </Alert>

          <Text size="sm" c="dimmed">
            Would you like to invite <strong>{name.trim() || "them"}</strong> to join GigKraft?
          </Text>

          <Group gap="xs">
            <Button
              flex={1}
              radius="xl"
              onClick={openWizard}
              style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}
              leftSection={<IconMailForward size={15} color="#fff" />}
            >
              Send Invite
            </Button>
            <button style={nativeBtn({ disabled: acting })} onClick={backToForm} disabled={acting}>
              Cancel
            </button>
          </Group>
        </Stack>
      );
    }

    // Default: form
    return (
      <>
        <FieldRow label="Name" required>
          <TextInput
            placeholder="Joe Smith"
            value={name}
            error={nameError}
            onChange={(e) => { setName(e.currentTarget.value); setNameError(null); }}
            onBlur={() => setNameError(validateName(name))}
          />
        </FieldRow>
        <FieldRow label="Phone">
          <TextInput
            placeholder="+1 555 000 0000"
            value={phone}
            error={phoneError}
            onChange={(e) => { setPhone(e.currentTarget.value); setPhoneError(null); }}
            onBlur={() => {
              setPhoneError(validatePhone(phone));
              void tryAutoFillTrade(phone, email);
            }}
          />
        </FieldRow>
        <FieldRow label="Email">
          <TextInput
            placeholder="joe@example.com"
            value={email}
            error={emailError}
            onChange={(e) => { setEmail(e.currentTarget.value); setEmailError(null); }}
            onBlur={() => {
              setEmailError(validateEmail(email));
              void tryAutoFillTrade(phone, email);
            }}
          />
        </FieldRow>
        <FieldRow label="Trade">
          <Autocomplete
            placeholder="Type or pick a trade…"
            data={TRADE_OPTIONS}
            value={trade}
            onChange={(v) => { setTrade(v); setTradeAutoFilled(false); }}
            description={tradeAutoFilled ? "Auto-filled from their GigKraft profile" : undefined}
          />
        </FieldRow>
        <FieldRow label="Zip">
          <TextInput
            placeholder="90210"
            value={zip}
            onChange={(e) => setZip(e.currentTarget.value)}
          />
        </FieldRow>
        <Text size="xs" c="dimmed" mt={-4}>
          Enter a phone or email to search GigKraft. If found you'll confirm before adding; otherwise you can send an invite.
        </Text>
        <Button
          fullWidth
          radius="xl"
          loading={searching}
          leftSection={!searching ? <IconSearch size={15} color="#fff" /> : undefined}
          onClick={() => void handleSearch()}
          style={{ background: "var(--gk-brand-gradient)", color: "#fff" }}
        >
          {searching ? "Searching…" : "Search"}
        </Button>
      </>
    );
  }

  return (
    <>
      <Modal
        opened={opened && !wizardOpen}
        onClose={handleClose}
        title="Add a Pro"
        centered
        size="sm"
        styles={{
          content: {
            border: "1.5px solid var(--gk-accent-primary)",
            boxShadow: "6px 6px 0 var(--gk-accent-secondary)",
            borderRadius: 10,
          },
        }}
      >
        <Stack gap="sm">
          <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} />
          {renderContent()}
        </Stack>
      </Modal>

      {wizardOpen && (
        <InviteWizardModal
          opened
          onClose={handleWizardClose}
          scenario="pro"
          slug={slug}
          senderName={senderName}
          onSent={handleWizardSent}
          initialRecipient={{ name: name.trim(), trade: trade.trim(), contact: phone.trim() || email.trim(), zip: zip.trim() }}
        />
      )}
    </>
  );
}
