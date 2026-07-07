import { ActionIcon, Group, Loader, Popover, Stack, Text, Textarea, Tooltip } from "@mantine/core";
import { IconBrandWhatsapp, IconMail, IconMailOpened, IconMessage } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { confirmInviteSent, sendInviteChannel } from "../../../api/endpoints";
import type { InviteScenario } from "../types";

/** A contact value is treated as an email whenever it contains "@"; otherwise it's a phone number. */
export function isEmailContact(v: string) {
  return v.includes("@");
}

export function buildWaLink(phone: string, body: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}

export function buildSmsLink(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

/** Convert editor HTML to plain text, preserving paragraph breaks as newlines. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Convert editor HTML to WhatsApp markdown (*bold*, _italic_). */
export function htmlToWhatsApp(html: string): string {
  return html
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "*$1*")
    .replace(/<b>([\s\S]*?)<\/b>/gi, "*$1*")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<i>([\s\S]*?)<\/i>/gi, "_$1_")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Picks a channel that's actually usable for the given contact, keeping `preferred` if it still applies. */
export function resolveChannel(contact: string, preferred: string): string {
  if (!contact.trim()) return preferred;
  const email = isEmailContact(contact);
  const preferredValid = email ? preferred === "email" : preferred !== "email";
  if (preferredValid) return preferred;
  return email ? "email" : "whatsapp";
}

const CHANNELS = [
  { value: "whatsapp", icon: IconBrandWhatsapp, label: "WhatsApp" },
  { value: "sms", icon: IconMessage, label: "SMS" },
  { value: "email", icon: IconMail, label: "Email" },
] as const;

/** Small inline icon row for picking a send channel — replaces a dropdown so a whole contact row fits on one line. */
export function ChannelPicker({
  contact,
  value,
  onChange,
}: {
  contact: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const email = isEmailContact(contact);
  return (
    <Group gap={3} wrap="nowrap">
      {CHANNELS.map(({ value: v, icon: Icon, label }) => {
        const enabled = contact.trim() === "" || (v === "email" ? email : !email);
        const active = value === v;
        return (
          <ActionIcon
            key={v}
            variant={active ? "filled" : "subtle"}
            disabled={!enabled}
            onClick={() => onChange(v)}
            title={label}
            aria-label={label}
            radius="xl"
            size="sm"
            style={
              active
                ? { background: "var(--gk-brand-gradient)", color: "#fff" }
                : { color: "var(--gk-accent-secondary)" }
            }
          >
            <Icon size={12} />
          </ActionIcon>
        );
      })}
    </Group>
  );
}

// ─── The referrer page's native pill button style (see ReferrerAccountPage) ──
// Solid accent-primary fill for the primary action, outlined accent-primary
// for everything else — shared here so every invite popup matches /account.

export function nativeBtn(opts: { primary?: boolean; small?: boolean; disabled?: boolean } = {}): React.CSSProperties {
  const { primary = false, small = false, disabled = false } = opts;
  return {
    background: disabled ? "var(--gk-border)" : primary ? "var(--gk-accent-primary)" : "transparent",
    color: primary ? "#fff" : "var(--gk-accent-primary)",
    border: primary ? "none" : "1.5px solid var(--gk-accent-primary)",
    borderRadius: 99,
    padding: small ? "3px 12px" : "6px 20px",
    fontSize: small ? 11 : 13,
    fontWeight: 700,
    letterSpacing: "0.03em",
    cursor: disabled ? "default" : "pointer",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: "1.5",
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled || !primary
      ? "0 1px 3px rgba(0,0,0,0.06)"
      : "0 3px 10px -2px var(--gk-accent-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
    transition: "all 0.15s ease",
  };
}

// ─── Per-contact channel send icons — email + phone (SMS/WhatsApp) ───────────
// Email sends immediately through the backend. SMS/WhatsApp can't be sent
// server-side, so the icon opens a popover: copy the message (which also opens
// the referrer's own WhatsApp/Messages app via a deep link), then confirm once
// it's actually been sent — that confirmation is what increments the count.
// Once a channel has been used at least once its icon becomes a static
// sent-count indicator; further resends go through the existing Resend button.

const PRIMARY = "var(--gk-accent-primary)";

function IconCount({
  count, busy, enabled, tooltip, onClick, children,
}: {
  count: number; busy: boolean; enabled: boolean; tooltip: string; onClick?: () => void; children: React.ReactNode;
}) {
  return (
    <Tooltip label={tooltip} withArrow>
      <Group
        gap={2} wrap="nowrap"
        style={{ color: PRIMARY, opacity: count > 0 ? 1 : 0.4, cursor: enabled ? "pointer" : "default", flexShrink: 0 }}
        onClick={enabled ? onClick : undefined}
      >
        {busy ? <Loader size={12} color={PRIMARY} /> : children}
        {count > 0 && <Text fw={700} style={{ fontSize: 9 }}>×{count}</Text>}
      </Group>
    </Tooltip>
  );
}

function PhoneIcon({
  channel, count, busy, opened, draft, onOpenChange, onDraftChange, onCopyOpen, onConfirm,
}: {
  channel: "sms" | "whatsapp";
  count: number;
  busy: boolean;
  opened: boolean;
  draft: string;
  onOpenChange: (v: boolean) => void;
  onDraftChange: (v: string) => void;
  onCopyOpen: () => void;
  onConfirm: () => void;
}) {
  const Icon = channel === "whatsapp" ? IconBrandWhatsapp : IconMessage;
  const label = channel === "whatsapp" ? "WhatsApp" : "Text";

  if (count > 0) {
    return (
      <IconCount count={count} busy={false} enabled={false} tooltip={`${label} sent ×${count}`}>
        <Icon size={15} />
      </IconCount>
    );
  }

  return (
    <Popover opened={opened} onChange={onOpenChange} withArrow position="bottom" width={260} shadow="md">
      <Popover.Target>
        <span>
          <IconCount count={0} busy={busy} enabled={!busy} tooltip={`Send via ${label}`}>
            <Icon size={15} />
          </IconCount>
        </span>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={6}>
          <Text size="xs" c="dimmed">
            Copy the message and send it from your {label} app, then confirm below.
          </Text>
          <Textarea
            size="xs" minRows={3} autosize
            value={draft}
            onChange={(e) => onDraftChange(e.currentTarget.value)}
          />
          <Group justify="space-between" gap={6}>
            <button type="button" style={nativeBtn({ small: true })} onClick={onCopyOpen}>
              Copy &amp; Open
            </button>
            <button
              type="button"
              style={nativeBtn({ primary: true, small: true, disabled: busy })}
              disabled={busy}
              onClick={onConfirm}
            >
              Mark as Sent
            </button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

/** Email icon — sits next to the Email column. Sends immediately (once) via the backend. */
export function EmailChannelIcon({
  scenario, inviteId, email, opened, count, onChanged,
}: {
  scenario: InviteScenario;
  inviteId: number | null;
  email: string;
  opened: boolean;
  count: number;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (inviteId == null || !email) return null;

  async function handleClick() {
    setBusy(true);
    try {
      await sendInviteChannel(scenario, inviteId!, "email");
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not send email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <IconCount
      count={count}
      busy={busy}
      enabled={count === 0 && !busy}
      tooltip={count > 0 ? `Email sent ×${count}${opened ? " · opened" : ""}` : "Send invite email"}
      onClick={() => void handleClick()}
    >
      {opened ? <IconMailOpened size={15} /> : <IconMail size={15} />}
    </IconCount>
  );
}

/** SMS + WhatsApp icons — sit next to the Phone column. Neither can be sent server-side,
 * so each opens a copy-the-message-then-confirm popover instead of sending directly. */
export function PhoneChannelIcons({
  scenario, inviteId, phone, smsCount, whatsappCount, onChanged,
}: {
  scenario: InviteScenario;
  inviteId: number | null;
  phone: string;
  smsCount: number;
  whatsappCount: number;
  onChanged: () => void;
}) {
  const [popover, setPopover] = useState<"sms" | "whatsapp" | null>(null);
  const [busyChannel, setBusyChannel] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!popover || inviteId == null || drafts[popover] !== undefined) return;
    let cancelled = false;
    setBusyChannel(popover);
    sendInviteChannel(scenario, inviteId, popover)
      .then((res) => { if (!cancelled) setDrafts((d) => ({ ...d, [popover]: res.message_body ?? "" })); })
      .catch((e) => {
        if (cancelled) return;
        alert(e instanceof Error ? e.message : "Could not prepare message.");
        setPopover(null);
      })
      .finally(() => { if (!cancelled) setBusyChannel(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popover, inviteId]);

  if (inviteId == null || !phone) return null;

  function copyAndOpen(channel: "sms" | "whatsapp") {
    const msg = drafts[channel] ?? "";
    if (navigator.clipboard) void navigator.clipboard.writeText(msg).catch(() => {});
    window.open(channel === "whatsapp" ? buildWaLink(phone, msg) : buildSmsLink(phone, msg), "_blank");
  }

  async function handleConfirmSent(channel: "sms" | "whatsapp") {
    setBusyChannel(channel);
    try {
      await confirmInviteSent(scenario, inviteId!, channel);
      setPopover(null);
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not confirm.");
    } finally {
      setBusyChannel(null);
    }
  }

  return (
    <Group gap={6} wrap="nowrap">
      <PhoneIcon
        channel="sms" count={smsCount}
        busy={busyChannel === "sms"} opened={popover === "sms"}
        draft={drafts.sms ?? ""}
        onOpenChange={(v) => setPopover(v ? "sms" : null)}
        onDraftChange={(v) => setDrafts((d) => ({ ...d, sms: v }))}
        onCopyOpen={() => copyAndOpen("sms")}
        onConfirm={() => void handleConfirmSent("sms")}
      />
      <PhoneIcon
        channel="whatsapp" count={whatsappCount}
        busy={busyChannel === "whatsapp"} opened={popover === "whatsapp"}
        draft={drafts.whatsapp ?? ""}
        onOpenChange={(v) => setPopover(v ? "whatsapp" : null)}
        onDraftChange={(v) => setDrafts((d) => ({ ...d, whatsapp: v }))}
        onCopyOpen={() => copyAndOpen("whatsapp")}
        onConfirm={() => void handleConfirmSent("whatsapp")}
      />
    </Group>
  );
}
