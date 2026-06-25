import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconBolt, IconExternalLink, IconStar, IconUser } from "@tabler/icons-react";
import { useState } from "react";

import { getAccessToken } from "../../../api/tokens";
import { API_BASE_URL } from "../../../config";

interface ProMatch {
  id: number;
  handle: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  primary_trade: string | null;
  skill_tags: string[];
  krafts_verified: number;
  recs_approved: number;
}

export interface OffPlatformPayload {
  name: string;
  skill: string;
  phone: string;
  email: string;
  endorsement: string;
}

interface Props {
  onAddOnPlatform: (proId: number, endorsement: string) => Promise<void>;
  onAddOffPlatform: (payload: OffPlatformPayload) => Promise<void>;
  busy: boolean;
}

type SearchStatus = "idle" | "searching" | "found" | "not_found";

export function AddProUnified({ onAddOnPlatform, onAddOffPlatform, busy }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [match, setMatch] = useState<ProMatch | null>(null);
  const [endorsement, setEndorsement] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (!name.trim() && !phone.trim() && !email.trim()) {
      setError("Enter a name, mobile, or email to search.");
      return;
    }
    setStatus("searching");
    setError(null);
    setMatch(null);
    try {
      const token = getAccessToken();
      const params = new URLSearchParams();
      if (name.trim()) params.set("name", name.trim());
      if (phone.trim()) params.set("phone", phone.trim());
      if (email.trim()) params.set("email", email.trim());
      const r = await fetch(`${API_BASE_URL}/api/circles/me/find-pro?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (r.ok) {
        setMatch((await r.json()) as ProMatch);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch {
      setStatus("not_found");
    }
  }

  async function handleAddOnPlatform() {
    if (!match) return;
    await onAddOnPlatform(match.id, endorsement);
    reset();
  }

  async function handleAddOffPlatform() {
    if (!name.trim()) { setError("Name is required to invite."); return; }
    if (!phone.trim() && !email.trim()) { setError("Provide a phone or email to invite."); return; }
    await onAddOffPlatform({ name: name.trim(), skill: "", phone: phone.trim(), email: email.trim(), endorsement });
    reset();
  }

  function reset() {
    setName(""); setPhone(""); setEmail("");
    setStatus("idle"); setMatch(null); setEndorsement(""); setError(null);
  }

  const profileUrl = match?.handle
    ? `${window.location.origin}/pros/${match.handle}`
    : null;

  return (
    <Stack gap="sm">
      {error && <Text c="red" size="xs">{error}</Text>}

      <Paper
        withBorder
        radius="md"
        p="sm"
        style={{ borderColor: "var(--gk-accent-primary)", boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)" }}
      >
        <Stack gap="xs">
          <TextInput
            label="Full name"
            placeholder="Dave Smith"
            maxLength={50}
            size="sm"
            style={{ maxWidth: 260 }}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Group gap="xs" grow>
            <TextInput
              label="Mobile"
              placeholder="+1 555 0000"
              size="xs"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              placeholder="dave@example.com"
              size="xs"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </Group>
          <Group justify="flex-end" mt={2}>
            <Button
              loading={status === "searching"}
              onClick={search}
              radius="xl"
              size="sm"
              style={{ background: "var(--gk-brand-gradient, #4F46E5)", paddingInline: 24 }}
            >
              Search
            </Button>
          </Group>
        </Stack>
      </Paper>

      {status === "found" && match && (
        <>
          <Divider label="Found on Gigkraft" labelPosition="center" my={2} />
          <Card
            withBorder
            radius="md"
            p="sm"
            style={{ borderColor: "var(--gk-accent-primary)", boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)" }}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Avatar src={match.avatar_url} radius="xl" size="md" color="teal">
                {match.display_name[0]?.toUpperCase()}
              </Avatar>
              <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="nowrap">
                  <Text fw={600} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {match.display_name}
                  </Text>
                  <Badge color="green" variant="light" size="xs">On Gigkraft</Badge>
                </Group>

                {profileUrl && match.handle && (
                  <Anchor
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    c="dimmed"
                    style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                  >
                    @{match.handle}
                    <IconExternalLink size={11} />
                  </Anchor>
                )}

                {match.primary_trade && (
                  <Text size="xs" c="dimmed">{match.primary_trade}</Text>
                )}

                {match.bio && (
                  <Text size="xs" c="dimmed" lineClamp={2}>{match.bio}</Text>
                )}

                {match.skill_tags.length > 0 && (
                  <Group gap={4} mt={2}>
                    {match.skill_tags.slice(0, 4).map((s) => (
                      <Badge key={s} size="xs" variant="outline" color="gray">{s}</Badge>
                    ))}
                  </Group>
                )}

                <Group gap="sm" mt={2}>
                  <Group gap={4}>
                    <IconBolt size={12} color="var(--mantine-primary-color-filled)" />
                    <Text size="xs">{match.krafts_verified} Krafts</Text>
                  </Group>
                  <Group gap={4}>
                    <IconStar size={12} color="var(--mantine-color-yellow-5)" />
                    <Text size="xs">{match.recs_approved} Recs</Text>
                  </Group>
                </Group>
              </Stack>
            </Group>

            <TextInput
              mt="xs"
              placeholder="1-sentence endorsement (optional, 160 chars max)"
              maxLength={160}
              size="xs"
              value={endorsement}
              onChange={(e) => setEndorsement(e.currentTarget.value)}
            />
            <Group gap="xs" mt="xs">
              <Button
                size="xs"
                loading={busy}
                onClick={handleAddOnPlatform}
                style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
              >
                Add to Circle
              </Button>
              <Button size="xs" variant="subtle" c="dimmed" onClick={reset}>
                Clear
              </Button>
            </Group>
          </Card>
        </>
      )}

      {status === "not_found" && (
        <>
          <Divider label="Not on Gigkraft yet" labelPosition="center" my={2} />
          <Card
            withBorder
            radius="md"
            p="sm"
            style={{ borderColor: "var(--gk-accent-primary)", boxShadow: "0 2px 12px color-mix(in srgb, var(--gk-accent-secondary) 20%, transparent)" }}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Avatar radius="xl" size="md" color="gray">
                <IconUser size={18} />
              </Avatar>
              <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="nowrap">
                  <Text fw={600} size="sm">{name || "Unknown"}</Text>
                  <Badge color="gray" variant="outline" size="xs">Invited / Pending</Badge>
                </Group>
                {email && <Text size="xs" c="dimmed">{email}</Text>}
                {phone && <Text size="xs" c="dimmed">{phone}</Text>}
              </Stack>
            </Group>

            <TextInput
              mt="xs"
              placeholder="1-sentence endorsement (optional, 160 chars max)"
              maxLength={160}
              size="xs"
              value={endorsement}
              onChange={(e) => setEndorsement(e.currentTarget.value)}
            />
            <Group gap="xs" mt="xs">
              <Button
                size="xs"
                loading={busy}
                onClick={handleAddOffPlatform}
                style={{ background: "var(--gk-brand-gradient, #4F46E5)" }}
              >
                Invite &amp; Add to Circle
              </Button>
              <Button size="xs" variant="subtle" c="dimmed" onClick={reset}>
                Clear
              </Button>
            </Group>
          </Card>
        </>
      )}
    </Stack>
  );
}
