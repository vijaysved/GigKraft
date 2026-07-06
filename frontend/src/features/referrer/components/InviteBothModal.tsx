import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconSend, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { createFriendInvite, createProInvite, getReferrerMe } from "../../../api/endpoints";
import { useAuth } from "../../../auth/AuthContext";

const TRADE_OPTIONS = [
  "Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Carpentry",
  "Flooring", "Landscaping", "General Contractor", "Cleaning", "Moving",
  "Pest Control", "Masonry", "Drywall", "Tile", "Other",
];

// Short, transactional, single-SMS-segment templates — distinct from the
// marketing-toned templates in InviteWizardModal, since these credit a
// specific person ("X recommended you") rather than pitch the platform.
const TEMPLATES = {
  pro: "Hi {{recipient_name}}! {{sender_name}} recommended you on Gigkraft. Set up your free pro profile: {{link}}",
  friend: "Hey {{recipient_name}}! {{sender_name}} added a trusted pro to Gigkraft for you. Check it out: {{link}}",
};

function resolveMessage(template: string, vars: { recipientName: string; senderName: string; link: string }) {
  return template
    .replace(/\{\{recipient_name\}\}/g, vars.recipientName || "there")
    .replace(/\{\{sender_name\}\}/g, vars.senderName)
    .replace(/\{\{link\}\}/g, vars.link);
}

function buildWaLink(phone: string, body: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}

function buildSmsLink(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

interface ProContact {
  name: string;
  trade: string;
  phone: string;
  email: string;
  channel: string;
}

interface FriendContact {
  name: string;
  phone: string;
  email: string;
  channel: string;
}

const EMPTY_PRO: ProContact = { name: "", trade: "", phone: "", email: "", channel: "whatsapp" };
const EMPTY_FRIEND: FriendContact = { name: "", phone: "", email: "", channel: "whatsapp" };

/** Disable channels the contact can't actually receive — no phone means no SMS/WhatsApp, no email means no Email. */
function channelOptions(contact: { phone: string; email: string }) {
  return [
    { value: "whatsapp", label: "WhatsApp", disabled: !contact.phone.trim() },
    { value: "sms", label: "SMS", disabled: !contact.phone.trim() },
    { value: "email", label: "Email", disabled: !contact.email.trim() },
  ];
}

function firstEnabledChannel(contact: { phone: string; email: string }): string {
  return channelOptions(contact).find((o) => !o.disabled)?.value ?? "whatsapp";
}

interface SendOutcome {
  ok: boolean;
  error?: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  slug: string;
  onSent: () => void;
}

export function InviteBothModal({ opened, onClose, slug: initialSlug, onSent }: Props) {
  const { user } = useAuth();
  const senderName = user?.first_name || "";

  const [pro, setPro] = useState<ProContact>({ ...EMPTY_PRO });
  const [friend, setFriend] = useState<FriendContact>({ ...EMPTY_FRIEND });
  const [proError, setProError] = useState<string | null>(null);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [slug, setSlug] = useState(initialSlug);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ pro: SendOutcome; friend: SendOutcome } | null>(null);

  useEffect(() => {
    if (!opened) return;
    if (initialSlug) {
      setSlug(initialSlug);
      return;
    }
    getReferrerMe()
      .then((data) => setSlug(data.profile.slug))
      .catch(() => {});
  }, [opened, initialSlug]);

  function reset() {
    setPro({ ...EMPTY_PRO });
    setFriend({ ...EMPTY_FRIEND });
    setProError(null);
    setFriendError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updatePro(field: keyof ProContact, value: string) {
    setPro((p) => {
      const next = { ...p, [field]: value };
      if (field === "phone" || field === "email") {
        const current = channelOptions(next).find((o) => o.value === next.channel);
        if (!current || current.disabled) next.channel = firstEnabledChannel(next);
      }
      return next;
    });
    setProError(null);
  }

  function updateFriend(field: keyof FriendContact, value: string) {
    setFriend((f) => {
      const next = { ...f, [field]: value };
      if (field === "phone" || field === "email") {
        const current = channelOptions(next).find((o) => o.value === next.channel);
        if (!current || current.disabled) next.channel = firstEnabledChannel(next);
      }
      return next;
    });
    setFriendError(null);
  }

  function validate(): boolean {
    let ok = true;
    if (!pro.name.trim() || (!pro.phone.trim() && !pro.email.trim())) {
      setProError("Name and a phone or email are required.");
      ok = false;
    }
    if (!friend.name.trim() || (!friend.phone.trim() && !friend.email.trim())) {
      setFriendError("Name and a phone or email are required.");
      ok = false;
    }
    return ok;
  }

  async function sendPro(note?: string): Promise<SendOutcome> {
    try {
      const link = `gigkraft.com/us/${slug}/refer`;
      const message = resolveMessage(TEMPLATES.pro, {
        recipientName: pro.name.trim().split(" ")[0],
        senderName,
        link,
      });
      const res = await createProInvite({
        name: pro.name.trim(),
        trade: pro.trade.trim() || undefined,
        phone: pro.phone.trim() || undefined,
        email: pro.email.trim() || undefined,
        note,
        channel: pro.channel,
        message,
      });
      if ((pro.channel === "sms" || pro.channel === "whatsapp") && pro.phone.trim()) {
        const finalLink = `https://gigkraft.com/us/${res.referrer_slug}/refer?claim=${res.token}`;
        const finalMessage = message.replace(link, finalLink);
        const url = pro.channel === "whatsapp"
          ? buildWaLink(pro.phone, finalMessage)
          : buildSmsLink(pro.phone, finalMessage);
        window.open(url, "_blank");
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
    }
  }

  async function sendFriend(): Promise<SendOutcome> {
    try {
      const link = `gigkraft.com/us/${slug}/refer`;
      const message = resolveMessage(TEMPLATES.friend, {
        recipientName: friend.name.trim().split(" ")[0],
        senderName,
        link,
      });
      const res = await createFriendInvite({
        name: friend.name.trim(),
        phone: friend.phone.trim() || undefined,
        email: friend.email.trim() || undefined,
        channel: friend.channel,
        message,
      });
      if ((friend.channel === "sms" || friend.channel === "whatsapp") && friend.phone.trim()) {
        const finalLink = `https://gigkraft.com/us/${res.referrer_slug}/refer?inv=${res.token}`;
        const finalMessage = message.replace(link, finalLink);
        const url = friend.channel === "whatsapp"
          ? buildWaLink(friend.phone, finalMessage)
          : buildSmsLink(friend.phone, finalMessage);
        window.open(url, "_blank");
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
    }
  }

  async function handleSend() {
    if (!validate()) return;
    setSubmitting(true);
    const friendName = friend.name.trim();
    const [proOutcome, friendOutcome] = await Promise.all([
      sendPro(friendName ? `Recommended by ${friendName}` : undefined),
      sendFriend(),
    ]);
    setSubmitting(false);
    setResult({ pro: proOutcome, friend: friendOutcome });
    if (proOutcome.ok || friendOutcome.ok) onSent();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Invite Them (Pro + Friend)" centered size="lg" radius="md">
      <Stack gap="lg">
        {result ? (
          <Stack gap="md" py="xs">
            <Alert
              color={result.pro.ok ? "teal" : "red"}
              variant="light"
              icon={result.pro.ok ? <IconCheck size={16} /> : undefined}
              title={`Pro: ${pro.name || "—"}`}
            >
              <Text size="sm">{result.pro.ok ? "Invited." : result.pro.error ?? "Failed to send."}</Text>
            </Alert>
            <Alert
              color={result.friend.ok ? "teal" : "red"}
              variant="light"
              icon={result.friend.ok ? <IconCheck size={16} /> : undefined}
              title={`Friend: ${friend.name || "—"}`}
            >
              <Text size="sm">{result.friend.ok ? "Invited." : result.friend.error ?? "Failed to send."}</Text>
            </Alert>
            <Button onClick={handleClose} variant="light">Close</Button>
          </Stack>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Invite a pro you're recommending and the friend who asked for them — in one go.
              Each gets a message crediting the other.
            </Text>

            <Box>
              <Group gap={6} mb={6}>
                <IconUserPlus size={14} />
                <Text size="sm" fw={700}>Pro</Text>
              </Group>
              <Stack gap="xs">
                <Group gap="xs" wrap="wrap">
                  <TextInput
                    label="Name" placeholder="Joe Smith" value={pro.name}
                    onChange={(e) => updatePro("name", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <Autocomplete
                    label="Trade" placeholder="Plumbing…" data={TRADE_OPTIONS} value={pro.trade}
                    onChange={(v) => updatePro("trade", v)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                </Group>
                <Group gap="xs" wrap="wrap">
                  <TextInput
                    label="Phone" placeholder="+1 555…" value={pro.phone}
                    onChange={(e) => updatePro("phone", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <TextInput
                    label="Email" placeholder="joe@…" value={pro.email}
                    onChange={(e) => updatePro("email", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <Select
                    label="Send via" data={channelOptions(pro)} value={pro.channel}
                    onChange={(v) => v && setPro((p) => ({ ...p, channel: v }))}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                </Group>
                {proError && <Text size="xs" c="red">{proError}</Text>}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Group gap={6} mb={6}>
                <IconUsers size={14} />
                <Text size="sm" fw={700}>Friend</Text>
              </Group>
              <Stack gap="xs">
                <TextInput
                  label="Name" placeholder="Jane Doe" value={friend.name}
                  onChange={(e) => updateFriend("name", e.currentTarget.value)}
                />
                <Group gap="xs" wrap="wrap">
                  <TextInput
                    label="Phone" placeholder="+1 555…" value={friend.phone}
                    onChange={(e) => updateFriend("phone", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <TextInput
                    label="Email" placeholder="jane@…" value={friend.email}
                    onChange={(e) => updateFriend("email", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <Select
                    label="Send via" data={channelOptions(friend)} value={friend.channel}
                    onChange={(v) => v && setFriend((f) => ({ ...f, channel: v }))}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                </Group>
                {friendError && <Text size="xs" c="red">{friendError}</Text>}
              </Stack>
            </Box>

            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={handleClose}>Cancel</Button>
              <Button leftSection={<IconSend size={14} />} loading={submitting} onClick={() => void handleSend()}>
                Send Both Invites
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
