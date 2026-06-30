import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconSend, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { createCircleShare, createFriendInvite, createProInvite } from "../../../api/endpoints";
import type { InviteScenario } from "../types";

const TRADE_OPTIONS = [
  "Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Carpentry",
  "Flooring", "Landscaping", "General Contractor", "Cleaning", "Moving",
  "Pest Control", "Masonry", "Drywall", "Tile", "Other",
];

interface Recipient {
  name: string;
  trade: string;
  phone: string;
  email: string;
}

const EMPTY_RECIPIENT: Recipient = { name: "", trade: "", phone: "", email: "" };

const SCENARIO_META: Record<InviteScenario, { title: string; intro: string; multiRecipient: boolean; needsTrade: boolean }> = {
  pro: {
    title: "Invite a Pro",
    intro: "Add someone to your trusted circle — they'll get a link to claim their free profile.",
    multiRecipient: false,
    needsTrade: true,
  },
  friend: {
    title: "Invite a Friend",
    intro: "Invite a neighbor or friend to follow your page so they can request referrals.",
    multiRecipient: false,
    needsTrade: false,
  },
  circle: {
    title: "Share My Circle",
    intro: "Share your page with people you want in your circle — add up to 10 at once.",
    multiRecipient: true,
    needsTrade: false,
  },
};

const MESSAGE_TEMPLATES: Record<InviteScenario, string> = {
  pro: "Hey {{recipient_name}}! I came across a platform called Gigkraft and immediately thought of your work. It's a marketplace built for independent professionals and freelancers to showcase their skills and land new clients. It could be a really great way to get your services in front of businesses looking for your exact expertise. Check it out and set up a profile here: {{link}} 🚀",
  friend: "Hey {{recipient_name}}! I just joined Gigkraft and wanted to share it with you. It's an awesome platform whether you need to hire trusted freelancers for a project (like design, tech, or marketing) or if you're looking to pick up some side gigs yourself. It makes finding and working with independent talent super easy. Here's my invite link if you want to look around: {{link}} ✨",
  circle: "Hey {{recipient_name}}! I'm building out my professional network on Gigkraft and wanted to invite you to join my circle. It's a great space for us to share gig opportunities, recommend each other's services to clients, and collaborate on projects. Let's connect on there and help each other grow! Here's my link to join: {{link}} 🙌",
};

function resolveMessage(template: string, vars: { recipientName: string; senderName: string; link: string }) {
  return template
    .replace(/\{\{recipient_name\}\}/g, vars.recipientName || "everyone")
    .replace(/\{\{sender_name\}\}/g, vars.senderName)
    .replace(/\{\{link\}\}/g, vars.link);
}

function buildWaLink(phone: string, body: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}

function buildSmsLink(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

interface Props {
  opened: boolean;
  onClose: () => void;
  scenario: InviteScenario;
  slug: string;
  senderName: string;
  onSent: () => void;
}

export function InviteWizardModal({ opened, onClose, scenario, slug, senderName, onSent }: Props) {
  const meta = SCENARIO_META[scenario];
  const [step, setStep] = useState(0);
  const [recipients, setRecipients] = useState<Recipient[]>([{ ...EMPTY_RECIPIENT }]);
  const [channel, setChannel] = useState("whatsapp");
  const [message, setMessage] = useState("");
  const [messageTouched, setMessageTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const previewLink = `gigkraft.com/us/${slug}/refer`;

  function isValid(r: Recipient) {
    return !!(r.name.trim() && (r.phone.trim() || r.email.trim()) && (!meta.needsTrade || r.trade));
  }

  const validRecipients = recipients.filter(isValid);

  function reset() {
    setStep(0);
    setRecipients([{ ...EMPTY_RECIPIENT }]);
    setChannel("whatsapp");
    setMessage("");
    setMessageTouched(false);
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateRecipient(i: number, field: keyof Recipient, val: string) {
    setRecipients((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function addRecipient() {
    if (recipients.length >= 10) return;
    setRecipients((rs) => [...rs, { ...EMPTY_RECIPIENT }]);
  }

  function removeRecipient(i: number) {
    setRecipients((rs) => rs.filter((_, idx) => idx !== i));
  }

  function goToMessageStep() {
    if (validRecipients.length === 0) return;
    const greeting = meta.multiRecipient && validRecipients.length > 1 ? "" : validRecipients[0].name.split(" ")[0];
    if (!messageTouched) {
      setMessage(resolveMessage(MESSAGE_TEMPLATES[scenario], { recipientName: greeting, senderName, link: previewLink }));
    }
    setStep(1);
  }

  async function handleSend() {
    setSubmitting(true);
    setError(null);
    let sent = 0;
    let failed = 0;
    for (const r of validRecipients) {
      try {
        let token: string;
        let referrerSlug: string;
        if (scenario === "pro") {
          const res = await createProInvite({
            name: r.name, phone: r.phone, email: r.email || undefined,
            channel, message,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        } else if (scenario === "friend") {
          const res = await createFriendInvite({
            name: r.name, phone: r.phone, email: r.email || undefined, channel, message,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        } else {
          const res = await createCircleShare({
            name: r.name, phone: r.phone || undefined, email: r.email || undefined, channel, message,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        }

        const claimParam = scenario === "pro" ? "claim" : scenario === "friend" ? "inv" : "circle";
        const finalLink = `https://gigkraft.com/us/${referrerSlug}/refer?${claimParam}=${token}`;
        // `message` is already fully resolved (tokens replaced in Step 2/3); just
        // swap the placeholder preview link for the real token-bearing link.
        const finalBody = message.replace(previewLink, finalLink);

        if (r.phone) {
          window.open(channel === "whatsapp" ? buildWaLink(r.phone, finalBody) : buildSmsLink(r.phone, finalBody), "_blank");
        }
        sent++;
      } catch {
        failed++;
      }
    }
    setSubmitting(false);
    setResult({ sent, failed });
    if (sent > 0) onSent();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={meta.title} centered size="lg" radius="md">
      <Stack gap="md">
        <Stepper active={step} size="xs" onStepClick={(i) => i < step && setStep(i)}>
          <Stepper.Step label="Recipient" description={meta.multiRecipient ? "Who's this for?" : "Who's this for?"} />
          <Stepper.Step label="Message" description="Personalize it" />
          <Stepper.Step label="Preview & Send" description="Review and send" />
        </Stepper>

        {result ? (
          <Stack align="center" py="lg" gap="xs">
            <Text fw={700}>
              {result.failed === 0
                ? "Sent! ✅"
                : `${result.sent} of ${result.sent + result.failed} sent.`}
            </Text>
            {result.failed > 0 && (
              <Text size="sm" c="dimmed">Some sends failed — you can retry from the Timeline below.</Text>
            )}
            <Button onClick={handleClose} variant="light" mt="sm">Close</Button>
          </Stack>
        ) : step === 0 ? (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">{meta.intro}</Text>
            {recipients.map((r, i) => (
              <Box key={i}>
                {i > 0 && <Divider my="xs" />}
                <Group gap="xs" align="flex-end" wrap="wrap">
                  <TextInput
                    label={i === 0 ? "Name" : undefined}
                    placeholder="Jane Doe"
                    value={r.name}
                    onChange={(e) => updateRecipient(i, "name", e.target.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  {meta.needsTrade && (
                    <Select
                      label={i === 0 ? "Trade" : undefined}
                      placeholder="Trade"
                      data={TRADE_OPTIONS}
                      value={r.trade || null}
                      onChange={(v) => updateRecipient(i, "trade", v ?? "")}
                      searchable
                      style={{ flex: 1, minWidth: 140 }}
                    />
                  )}
                  <TextInput
                    label={i === 0 ? "Phone" : undefined}
                    placeholder="+1 555…"
                    value={r.phone}
                    onChange={(e) => updateRecipient(i, "phone", e.target.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <TextInput
                    label={i === 0 ? "Email" : undefined}
                    placeholder="jane@…"
                    value={r.email}
                    onChange={(e) => updateRecipient(i, "email", e.target.value)}
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  {meta.multiRecipient && recipients.length > 1 && (
                    <ActionIcon color="red" variant="subtle" onClick={() => removeRecipient(i)} mb={2}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Box>
            ))}

            {meta.multiRecipient && recipients.length < 10 && (
              <Button size="xs" variant="subtle" leftSection={<IconPlus size={12} />} onClick={addRecipient}>
                Add another
              </Button>
            )}

            <Select
              label="Send via"
              data={[{ value: "whatsapp", label: "WhatsApp" }, { value: "sms", label: "SMS" }]}
              value={channel}
              onChange={(v) => setChannel(v ?? "whatsapp")}
            />

            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={handleClose}>Cancel</Button>
              <Button onClick={goToMessageStep} disabled={validRecipients.length === 0}>Next</Button>
            </Group>
          </Stack>
        ) : step === 1 ? (
          <Stack gap="sm">
            <Textarea
              label="Message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setMessageTouched(true); }}
              autosize
              minRows={5}
            />
            <Text size="xs" c="dimmed">
              This message will be sent exactly as written — feel free to personalize it.
            </Text>
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} disabled={!message.trim()}>Next</Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="sm">
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Text size="sm" c="dimmed">
              Preview — sent to {validRecipients.length} recipient{validRecipients.length === 1 ? "" : "s"}:
            </Text>
            {validRecipients.map((r, i) => (
              // Same resolved `message` for every recipient (see goToMessageStep) —
              // only the "To:" label differs per card.
              <Box
                key={i}
                p="sm"
                style={{
                  borderRadius: 12,
                  background: channel === "whatsapp" ? "#dcf8c6" : "var(--mantine-color-blue-0)",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Text size="xs" fw={600} c="dimmed" mb={4}>To: {r.name}</Text>
                <Text size="sm">{message}</Text>
              </Box>
            ))}
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setStep(1)}>Back</Button>
              <Button leftSection={<IconSend size={14} />} loading={submitting} onClick={handleSend}>
                Send
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
