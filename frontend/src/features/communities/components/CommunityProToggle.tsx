import {
  ActionIcon, Avatar, Badge, Box, Button, Group, Modal, Stack,
  Switch, Table, Text, Textarea, TextInput, Tooltip,
} from "@mantine/core";
import { IconArrowsSort, IconChevronDown, IconChevronUp, IconPencil, IconSearch, IconUpload, IconUserPlus } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getReferrerMe, updateReferrerPro } from "../../../api/endpoints";
import { useAuth } from "../../../auth/AuthContext";
import { encodeContactId } from "../../../utils/contactId";
import { formatPhone } from "../../../utils/format";
import { InviteWizardModal } from "../../referrer/components/InviteWizardModal";
import { communityFetch } from "../hooks/useCommunity";
import type { CommunityProCandidateOut } from "../types";
import { BulkImportProsModal } from "./BulkImportProsModal";

const ellipsis: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

type SortKey = "name" | "phone" | "email" | "trade" | "status" | "on_community";
type SortDir = "asc" | "desc";

function sortValue(rp: CommunityProCandidateOut, key: SortKey): string {
  switch (key) {
    case "name": return rp.name;
    case "phone": return rp.phone;
    case "email": return rp.email;
    case "trade": return rp.trade;
    case "status": return rp.is_on_platform ? "1" : "0";
    case "on_community": return rp.on_this_community ? "1" : "0";
  }
}

function SortableTh({
  col, sortBy, sortDir, onSort, minWidth, children,
}: {
  col: SortKey; sortBy: SortKey | null; sortDir: SortDir; onSort: (col: SortKey) => void;
  minWidth?: number; children: React.ReactNode;
}) {
  const active = sortBy === col;
  return (
    <Table.Th
      style={{ minWidth, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", color: "#000" }}
      onClick={() => onSort(col)}
    >
      <Group gap={3} wrap="nowrap">
        <span>{children}</span>
        {active ? (
          sortDir === "asc" ? <IconChevronUp size={11} /> : <IconChevronDown size={11} />
        ) : (
          <IconArrowsSort size={10} style={{ opacity: 0.3 }} />
        )}
      </Group>
    </Table.Th>
  );
}

interface Props {
  readOnly?: boolean;
}

export function CommunityProToggle({ readOnly }: Props) {
  const [pros, setPros] = useState<CommunityProCandidateOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rowLoading, setRowLoading] = useState<Record<number, boolean>>({});
  const [endorsementTarget, setEndorsementTarget] = useState<CommunityProCandidateOut | null>(null);
  const [endorsementDraft, setEndorsementDraft] = useState("");
  const [savingEndorsement, setSavingEndorsement] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [leadSlug, setLeadSlug] = useState("");
  const { user } = useAuth();
  const leadName = user?.first_name || "";
  const navigate = useNavigate();

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  }

  async function load() {
    setLoading(true);
    try {
      const res = await communityFetch("/api/me/community/pros/candidates");
      setPros(res.ok ? await res.json() as CommunityProCandidateOut[] : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    getReferrerMe().then((me) => {
      setLeadSlug(me?.profile?.slug ?? "");
    }).catch(() => undefined);
  }, []);

  async function linkToCommunity(referrerProId: number) {
    await communityFetch("/api/me/community/pros/toggle", {
      method: "POST",
      body: JSON.stringify({ referrer_pro_id: referrerProId }),
    });
  }

  async function toggle(rp: CommunityProCandidateOut) {
    setRowLoading((s) => ({ ...s, [rp.id]: true }));
    try {
      const res = await communityFetch("/api/me/community/pros/toggle", {
        method: "POST",
        body: JSON.stringify({ referrer_pro_id: rp.id }),
      });
      if (res.ok) await load();
    } finally {
      setRowLoading((s) => ({ ...s, [rp.id]: false }));
    }
  }

  function openEndorsementEditor(rp: CommunityProCandidateOut) {
    setEndorsementTarget(rp);
    setEndorsementDraft(rp.endorsement || "");
  }

  async function saveEndorsement() {
    if (!endorsementTarget) return;
    setSavingEndorsement(true);
    try {
      await updateReferrerPro(endorsementTarget.id, { endorsement: endorsementDraft });
      setEndorsementTarget(null);
      await load();
    } finally {
      setSavingEndorsement(false);
    }
  }

  function openContact(rp: CommunityProCandidateOut) {
    navigate(`/us/${leadSlug}/contacts/pro/${encodeContactId(rp.id)}`, {
      state: { returnTo: `/us/${leadSlug}/community?tab=pros` },
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q ? pros : pros.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.trade.toLowerCase().includes(q) ||
      (p.phone ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
    if (!sortBy) return base;
    return [...base].sort((a, b) => {
      const cmp = sortValue(a, sortBy).localeCompare(sortValue(b, sortBy), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [pros, search, sortBy, sortDir]);

  if (loading) return null;

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={0}>
            <Text fw={700} size="sm">Your Pros</Text>
            <Text size="xs" c="dimmed">Toggle which of your existing pros also appear on your Community's public page.</Text>
          </Stack>
          {!readOnly && (
            <Group gap="xs" wrap="wrap">
              <Button size="xs" radius="xl" leftSection={<IconUserPlus size={14} />}
                style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => setInviteOpen(true)}>
                Invite a Pro
              </Button>
              <Button size="xs" radius="xl" variant="light" leftSection={<IconUpload size={14} />} onClick={() => setBulkImportOpen(true)}>
                Bulk Import
              </Button>
            </Group>
          )}
        </Group>

        {pros.length === 0 ? (
          <Text size="sm" c="dimmed">You don't have any pros on your personal page yet.</Text>
        ) : (
          <>
            <TextInput
              placeholder="Search name, trade, phone, or email…"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            {filtered.length === 0 ? (
              <Text size="sm" c="dimmed" py="sm">No pros match the current search.</Text>
            ) : (
              <Box style={{ display: "inline-block", maxWidth: "min(1280px, 100%)", overflowX: "auto", borderRadius: 12, border: "1px solid var(--mantine-color-default-border)" }}>
                <Table verticalSpacing={2} horizontalSpacing="xs" striped highlightOnHover style={{ tableLayout: "auto", width: "auto" }}>
                  <Table.Thead style={{
                    background: "linear-gradient(135deg, var(--gk-accent-primary) 0%, var(--gk-accent-secondary) 100%)",
                  }}>
                    <Table.Tr style={{ color: "#000" }}>
                      <SortableTh col="name" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={120}>Name</SortableTh>
                      <SortableTh col="phone" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={110}>Phone</SortableTh>
                      <SortableTh col="email" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={140}>Email</SortableTh>
                      <SortableTh col="trade" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={90}>Trade</SortableTh>
                      <SortableTh col="status" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={90}>Status</SortableTh>
                      <SortableTh col="on_community" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} minWidth={100}>On Community</SortableTh>
                      <Table.Th style={{ width: 40 }}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((rp) => (
                      <Table.Tr key={rp.id}>
                        <Table.Td style={{ maxWidth: 150, ...ellipsis }}>
                          <Group gap={6} wrap="nowrap">
                            <Avatar src={rp.avatar_url || undefined} size={20} radius="xl">{rp.name[0]?.toUpperCase()}</Avatar>
                            <Text
                              component="a"
                              onClick={() => openContact(rp)}
                              size="sm"
                              fw={600}
                              c="blue"
                              style={{ cursor: "pointer", ...ellipsis }}
                            >
                              {rp.name}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 140 }}>
                          <Text size="xs" c={rp.phone ? undefined : "dimmed"} style={ellipsis}>{rp.phone ? formatPhone(rp.phone) : "—"}</Text>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 180 }}>
                          <Text size="xs" c={rp.email ? undefined : "dimmed"} style={ellipsis}>{rp.email || "—"}</Text>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 110, ...ellipsis }}>
                          <Text size="xs" c={rp.trade ? undefined : "dimmed"} style={ellipsis}>{rp.trade || "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" variant="light" color={rp.is_on_platform ? "green" : "gray"}>
                            {rp.is_on_platform ? "On Platform" : "Off-Platform"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Switch
                            size="sm"
                            checked={rp.on_this_community}
                            disabled={readOnly}
                            onChange={() => void toggle(rp)}
                            styles={{ track: rowLoading[rp.id] ? { opacity: 0.5 } : undefined }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Edit endorsement" withArrow>
                            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEndorsementEditor(rp)}>
                              <IconPencil size={13} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Stack>

      <Modal opened={!!endorsementTarget} onClose={() => setEndorsementTarget(null)} title="Edit endorsement" size="sm" centered>
        <Stack gap="sm">
          <Textarea
            placeholder="Why do you recommend this pro?"
            value={endorsementDraft}
            onChange={(e) => setEndorsementDraft(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="subtle" size="xs" radius="xl" onClick={() => setEndorsementTarget(null)}>Cancel</Button>
            <Button size="xs" radius="xl" loading={savingEndorsement}
              style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void saveEndorsement()}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <InviteWizardModal
        opened={inviteOpen}
        onClose={() => setInviteOpen(false)}
        scenario="pro"
        slug={leadSlug}
        senderName={leadName}
        onSent={() => void load()}
        onProCreated={({ referrerProId }) => linkToCommunity(referrerProId)}
      />

      <BulkImportProsModal
        opened={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImported={() => void load()}
      />
    </Stack>
  );
}
