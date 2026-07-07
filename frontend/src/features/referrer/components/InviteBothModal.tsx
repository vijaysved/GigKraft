import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { createFriendInvite, createProInvite, getReferrerMe } from "../../../api/endpoints";
import { useAuth } from "../../../auth/AuthContext";
import { ChannelPicker, buildSmsLink, buildWaLink, isEmailContact, nativeBtn, resolveChannel } from "./inviteShared";

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

interface ProContact {
  name: string;
  trade: string;
  contact: string;
  channel: string;
}

interface FriendContact {
  name: string;
  contact: string;
  channel: string;
}

const EMPTY_PRO: ProContact = { name: "", trade: "", contact: "", channel: "whatsapp" };
const EMPTY_FRIEND: FriendContact = { name: "", contact: "", channel: "whatsapp" };

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
    setPro((p) => ({ ...p, [field]: value }));
    setProError(null);
  }

  function updateProContact(value: string) {
    setPro((p) => ({ ...p, contact: value, channel: resolveChannel(value, p.channel) }));
    setProError(null);
  }

  function updateFriend(field: keyof FriendContact, value: string) {
    setFriend((f) => ({ ...f, [field]: value }));
    setFriendError(null);
  }

  function updateFriendContact(value: string) {
    setFriend((f) => ({ ...f, contact: value, channel: resolveChannel(value, f.channel) }));
    setFriendError(null);
  }

  function validate(): boolean {
    let ok = true;
    if (!pro.name.trim() || !pro.contact.trim()) {
      setProError("Name and a phone or email are required.");
      ok = false;
    }
    if (!friend.name.trim() || !friend.contact.trim()) {
      setFriendError("Name and a phone or email are required.");
      ok = false;
    }
    return ok;
  }

  async function sendPro(note?: string): Promise<SendOutcome> {
    try {
      const contact = pro.contact.trim();
      const isEmail = isEmailContact(contact);
      const phone = isEmail ? "" : contact;
      const email = isEmail ? contact : "";

      const link = `gigkraft.com/us/${slug}/refer`;
      const message = resolveMessage(TEMPLATES.pro, {
        recipientName: pro.name.trim().split(" ")[0],
        senderName,
        link,
      });
      const res = await createProInvite({
        name: pro.name.trim(),
        trade: pro.trade.trim() || undefined,
        phone: phone || undefined,
        email: email || undefined,
        note,
        channel: pro.channel,
        message,
      });
      if ((pro.channel === "sms" || pro.channel === "whatsapp") && phone) {
        const finalLink = `https://gigkraft.com/us/${res.referrer_slug}/refer?claim=${res.token}`;
        const finalMessage = message.replace(link, finalLink);
        const url = pro.channel === "whatsapp"
          ? buildWaLink(phone, finalMessage)
          : buildSmsLink(phone, finalMessage);
        window.open(url, "_blank");
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
    }
  }

  async function sendFriend(): Promise<SendOutcome> {
    try {
      const contact = friend.contact.trim();
      const isEmail = isEmailContact(contact);
      const phone = isEmail ? "" : contact;
      const email = isEmail ? contact : "";

      const link = `gigkraft.com/us/${slug}/refer`;
      const message = resolveMessage(TEMPLATES.friend, {
        recipientName: friend.name.trim().split(" ")[0],
        senderName,
        link,
      });
      const res = await createFriendInvite({
        name: friend.name.trim(),
        phone: phone || undefined,
        email: email || undefined,
        channel: friend.channel,
        message,
      });
      if ((friend.channel === "sms" || friend.channel === "whatsapp") && phone) {
        const finalLink = `https://gigkraft.com/us/${res.referrer_slug}/refer?inv=${res.token}`;
        const finalMessage = message.replace(link, finalLink);
        const url = friend.channel === "whatsapp"
          ? buildWaLink(phone, finalMessage)
          : buildSmsLink(phone, finalMessage);
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
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Invite Them (Pro + Friend)"
      centered
      size="lg"
      radius="md"
      styles={{
        content: {
          border: "1.5px solid var(--gk-accent-primary)",
          boxShadow: "6px 6px 0 var(--gk-accent-secondary)",
          borderRadius: 10,
        },
      }}
      closeButtonProps={{
        style: {
          color: "var(--gk-accent-primary)",
          background: "color-mix(in srgb, var(--gk-accent-secondary) 14%, transparent)",
        },
      }}
    >
      <Stack gap="lg">
        <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} />
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
                <Group gap="xs" align="center" wrap="nowrap">
                  <TextInput
                    placeholder="Name" value={pro.name} size="sm"
                    onChange={(e) => updatePro("name", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 100 }}
                  />
                  <Autocomplete
                    placeholder="Trade" data={TRADE_OPTIONS} value={pro.trade} size="sm"
                    onChange={(v) => updatePro("trade", v)}
                    style={{ flex: 1, minWidth: 100 }}
                  />
                  <TextInput
                    placeholder="Email or phone" value={pro.contact} size="sm"
                    onChange={(e) => updateProContact(e.currentTarget.value)}
                    style={{ flex: 1.2, minWidth: 140 }}
                  />
                  <ChannelPicker contact={pro.contact} value={pro.channel} onChange={(v) => setPro((p) => ({ ...p, channel: v }))} />
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
                <Group gap="xs" align="center" wrap="nowrap">
                  <TextInput
                    placeholder="Name" value={friend.name} size="sm"
                    onChange={(e) => updateFriend("name", e.currentTarget.value)}
                    style={{ flex: 1, minWidth: 100 }}
                  />
                  <TextInput
                    placeholder="Email or phone" value={friend.contact} size="sm"
                    onChange={(e) => updateFriendContact(e.currentTarget.value)}
                    style={{ flex: 1.2, minWidth: 140 }}
                  />
                  <ChannelPicker contact={friend.contact} value={friend.channel} onChange={(v) => setFriend((f) => ({ ...f, channel: v }))} />
                </Group>
                {friendError && <Text size="xs" c="red">{friendError}</Text>}
              </Stack>
            </Box>

            <Group justify="flex-end" mt="xs">
              <button style={nativeBtn({})} onClick={handleClose}>Cancel</button>
              <button
                style={nativeBtn({ primary: true, disabled: submitting })}
                onClick={() => void handleSend()}
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Both Invites"}
              </button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
