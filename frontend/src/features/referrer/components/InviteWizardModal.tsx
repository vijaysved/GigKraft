import {
  ActionIcon,
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCopy, IconSend, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { createCircleShare, createFriendInvite, createProInvite } from "../../../api/endpoints";
import type { InviteScenario } from "../types";
import {
  ChannelPicker, buildSmsLink, buildWaLink, htmlToPlainText, htmlToWhatsApp,
  isEmailContact, nativeBtn, resolveChannel,
} from "./inviteShared";

const TRADE_OPTIONS = [
  "Plumbing", "Electrical", "HVAC", "Roofing", "Painting", "Carpentry",
  "Flooring", "Landscaping", "General Contractor", "Cleaning", "Moving",
  "Pest Control", "Masonry", "Drywall", "Tile", "Other",
];

interface Recipient {
  name: string;
  trade: string;
  /** Email address or phone number — auto-detected by presence of "@". */
  contact: string;
  channel: string;
}

const EMPTY_RECIPIENT: Recipient = { name: "", trade: "", contact: "", channel: "whatsapp" };

const SCENARIO_META: Record<InviteScenario, { title: string; intro: string; multiRecipient: boolean; needsTrade: boolean }> = {
  pro: {
    title: "Invite a Pro",
    intro: "Add someone to your trusted circle — they'll get a link to claim their free profile.",
    multiRecipient: false,
    needsTrade: false,
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

interface Props {
  opened: boolean;
  onClose: () => void;
  scenario: InviteScenario;
  slug: string;
  senderName: string;
  onSent: () => void;
  /** Pre-fills the first recipient — used when arriving from a contact lookup that found no match. */
  initialRecipient?: Partial<Recipient>;
}

export function InviteWizardModal({ opened, onClose, scenario, slug, senderName, onSent, initialRecipient }: Props) {
  const meta = SCENARIO_META[scenario];
  const [step, setStep] = useState(0);
  const [recipients, setRecipients] = useState<Recipient[]>([{ ...EMPTY_RECIPIENT, ...initialRecipient }]);
  const [messageHtml, setMessageHtml] = useState("");
  const [messageTouched, setMessageTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    entries: Array<{ recipient: Recipient; message: string; channel: string }>;
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function copyMessage(i: number, text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(i);
      setTimeout(() => setCopiedIndex((c) => (c === i ? null : c)), 2000);
    });
  }

  const previewLink = `gigkraft.com/us/${slug}/refer`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your message…" }),
    ],
    content: "",
    onUpdate: ({ editor: ed }) => {
      setMessageHtml(ed.getHTML());
      setMessageTouched(true);
    },
  });

  function isValid(r: Recipient) {
    return !!(r.name.trim() && r.contact.trim() && (!meta.needsTrade || r.trade));
  }

  const validRecipients = recipients.filter(isValid);

  function reset() {
    setStep(0);
    setRecipients([{ ...EMPTY_RECIPIENT }]);
    setMessageHtml("");
    setMessageTouched(false);
    setError(null);
    setResult(null);
    editor?.commands.setContent("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateRecipient(i: number, field: keyof Recipient, val: string) {
    setRecipients((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  function updateContact(i: number, val: string) {
    setRecipients((rs) => rs.map((r, idx) =>
      idx === i ? { ...r, contact: val, channel: resolveChannel(val, r.channel) } : r
    ));
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
      const plain = resolveMessage(MESSAGE_TEMPLATES[scenario], { recipientName: greeting, senderName, link: previewLink });
      const html = `<p>${plain}</p>`;
      setMessageHtml(html);
      editor?.commands.setContent(html);
    }
    setStep(1);
  }

  async function handleSend() {
    setSubmitting(true);
    setError(null);
    let sent = 0;
    let failed = 0;
    const entries: Array<{ recipient: Recipient; message: string; channel: string }> = [];
    for (const r of validRecipients) {
      try {
        let token: string;
        let referrerSlug: string;

        const contact = r.contact.trim();
        const isEmail = isEmailContact(contact);
        const phone = isEmail ? "" : contact;
        const email = isEmail ? contact : "";

        const plainMessage = htmlToPlainText(messageHtml);

        if (scenario === "pro") {
          const res = await createProInvite({
            name: r.name, phone: phone || undefined, email: email || undefined,
            channel: r.channel, message: plainMessage,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        } else if (scenario === "friend") {
          const res = await createFriendInvite({
            name: r.name, phone: phone || undefined, email: email || undefined, channel: r.channel, message: plainMessage,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        } else {
          const res = await createCircleShare({
            name: r.name, phone: phone || undefined, email: email || undefined, channel: r.channel, message: plainMessage,
          });
          token = res.token; referrerSlug = res.referrer_slug;
        }

        const claimParam = scenario === "pro" ? "claim" : scenario === "friend" ? "inv" : "circle";
        const finalLink = `https://gigkraft.com/us/${referrerSlug}/refer?${claimParam}=${token}`;

        const body = r.channel === "whatsapp"
          ? htmlToWhatsApp(messageHtml).replace(previewLink, finalLink)
          : htmlToPlainText(messageHtml).replace(previewLink, finalLink);

        if (r.channel === "whatsapp" && phone) {
          window.open(buildWaLink(phone, body), "_blank");
        } else if (r.channel === "sms" && phone) {
          window.open(buildSmsLink(phone, body), "_blank");
        }

        entries.push({ recipient: r, message: body, channel: r.channel });
        sent++;
      } catch {
        failed++;
      }
    }
    setSubmitting(false);
    setResult({ sent, failed, entries });
    if (sent > 0) onSent();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={meta.title}
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
      <Stack gap="md">
        <Divider style={{ borderColor: "var(--gk-accent-secondary)" }} />
        <Stepper active={step} size="xs" onStepClick={(i) => i < step && setStep(i)}>
          <Stepper.Step label="Recipient" description={meta.multiRecipient ? "Who's this for?" : "Who's this for?"} />
          <Stepper.Step label="Message" description="Personalize it" />
          <Stepper.Step label="Preview & Send" description="Review and send" />
        </Stepper>

        {result ? (
          <Stack py="md" gap="md">
            <Text fw={700} ta="center">
              {result.failed === 0
                ? "Sent!"
                : `${result.sent} of ${result.sent + result.failed} sent.`}
            </Text>
            <Stack gap="xs">
              {result.entries.map((entry, i) => (
                <Box
                  key={i}
                  p="sm"
                  style={{ borderRadius: 8, background: "var(--mantine-color-gray-0)", border: "1px solid var(--mantine-color-default-border)" }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600}>{entry.recipient.name}</Text>
                      <Text size="xs" c="dimmed">{entry.recipient.contact}</Text>
                    </Stack>
                    {entry.channel !== "email" && (
                      <Button
                        size="xs"
                        variant="light"
                        color={copiedIndex === i ? "teal" : undefined}
                        leftSection={<IconCopy size={13} />}
                        onClick={() => copyMessage(i, entry.message)}
                      >
                        {copiedIndex === i
                          ? "Copied!"
                          : entry.channel === "whatsapp"
                          ? "Copy WhatsApp message"
                          : "Copy SMS message"}
                      </Button>
                    )}
                  </Group>
                </Box>
              ))}
            </Stack>
            {result.failed > 0 && (
              <Text size="sm" c="dimmed" ta="center">Some sends failed — retry from the Timeline.</Text>
            )}
            <Button onClick={handleClose} variant="light">Close</Button>
          </Stack>
        ) : step === 0 ? (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">{meta.intro}</Text>
            {recipients.map((r, i) => (
              <Box key={i}>
                {i > 0 && <Divider my="xs" />}
                <Group gap="xs" align="center" wrap="nowrap">
                  <TextInput
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) => updateRecipient(i, "name", e.target.value)}
                    size="sm"
                    style={{ flex: 1, minWidth: 100 }}
                  />
                  {meta.needsTrade && (
                    <Autocomplete
                      placeholder="Trade"
                      data={TRADE_OPTIONS}
                      value={r.trade}
                      onChange={(v) => updateRecipient(i, "trade", v)}
                      size="sm"
                      style={{ flex: 1, minWidth: 100 }}
                    />
                  )}
                  <TextInput
                    placeholder="Email or phone"
                    value={r.contact}
                    onChange={(e) => updateContact(i, e.target.value)}
                    size="sm"
                    style={{ flex: 1.2, minWidth: 140 }}
                  />
                  <ChannelPicker
                    contact={r.contact}
                    value={r.channel}
                    onChange={(v) => updateRecipient(i, "channel", v)}
                  />
                  {meta.multiRecipient && recipients.length > 1 && (
                    <ActionIcon color="red" variant="subtle" onClick={() => removeRecipient(i)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Box>
            ))}

            {meta.multiRecipient && recipients.length < 10 && (
              <button style={nativeBtn({ small: true })} onClick={addRecipient}>
                Add Another
              </button>
            )}

            <Group justify="flex-end" mt="xs">
              <button style={nativeBtn({})} onClick={handleClose}>Cancel</button>
              <button
                style={nativeBtn({ primary: true, disabled: validRecipients.length === 0 })}
                onClick={goToMessageStep}
                disabled={validRecipients.length === 0}
              >
                Next
              </button>
            </Group>
          </Stack>
        ) : step === 1 ? (
          <Stack gap="sm">
            <RichTextEditor editor={editor} style={{ minHeight: 200 }}>
              <RichTextEditor.Toolbar>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.ClearFormatting />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>
            <Text size="xs" c="dimmed">
              {validRecipients.some((r) => r.channel === "whatsapp")
                ? "Bold and italic formatting are preserved as WhatsApp markdown (*bold*, _italic_) when sent; other channels get it exactly as written."
                : "Format your message — it will be sent exactly as written."}
            </Text>
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setStep(0)}>Back</Button>
              <button
                style={nativeBtn({ primary: true, disabled: !editor?.getText().trim() })}
                onClick={() => setStep(2)}
                disabled={!editor?.getText().trim()}
              >
                Next
              </button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="sm">
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <Text size="sm" c="dimmed">
              Preview — sent to {validRecipients.length} recipient{validRecipients.length === 1 ? "" : "s"}:
            </Text>
            {validRecipients.map((r, i) => (
              <Box
                key={i}
                p="sm"
                style={{
                  borderRadius: 12,
                  background:
                    r.channel === "whatsapp" ? "#dcf8c6"
                    : r.channel === "email" ? "var(--mantine-color-gray-1)"
                    : "var(--mantine-color-blue-0)",
                }}
              >
                <Text size="xs" fw={600} c="dimmed" mb={4}>To: {r.name} ({r.contact})</Text>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {r.channel === "whatsapp" ? htmlToWhatsApp(messageHtml) : htmlToPlainText(messageHtml)}
                </Text>
              </Box>
            ))}
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={() => setStep(1)}>Back</Button>
              <Button leftSection={<IconSend size={14} />} loading={submitting} onClick={() => void handleSend()}>
                Send
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
