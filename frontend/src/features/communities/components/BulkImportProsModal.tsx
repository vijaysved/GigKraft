import { ActionIcon, Alert, Button, Checkbox, FileButton, Group, Modal, Select, SegmentedControl, Stack, Table, Tabs, TagsInput, Text, Textarea, TextInput, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconArrowsSort, IconCheck, IconChevronDown, IconChevronUp, IconTrash, IconUpload } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { communityFetch } from "../hooks/useCommunity";

interface ParsedRow {
  name: string;
  trade: string;
  phone: string;
  email: string;
  endorsement: string;
  tags: string[];
}

type TargetField = "name" | "trade" | "phone" | "email" | "endorsement";
type ColumnMapping = TargetField | "ignore";

const TARGET_FIELD_OPTIONS: { value: ColumnMapping; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "trade", label: "Category / Trade" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "endorsement", label: "Notes" },
  { value: "ignore", label: "Ignore this column" },
];

/** Best-effort guess of which field a source column header belongs to, so the mapping
 * step below starts pre-filled — the user can still override any column by hand
 * (e.g. "Vendor Name" / "Vendor Company" both guess Name; "Comments" guesses Notes). */
function guessField(header: string): ColumnMapping {
  const h = header.toLowerCase().trim();
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("phone") || h.includes("cell") || h.includes("mobile") || h.includes("tel")) return "phone";
  if (h.includes("categor") || h.includes("trade") || h.includes("type") || h.includes("service") || h.includes("skill")) return "trade";
  if (h.includes("note") || h.includes("comment") || h.includes("endorse")) return "endorsement";
  if (h.includes("name") || h.includes("compan") || h.includes("business") || h.includes("vendor")) return "name";
  return "ignore";
}

/** Splits one delimited line into cells, respecting double-quoted fields (so a comma or
 * tab inside a quoted value — e.g. a business name — doesn't shift later columns). */
function splitDelimited(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

interface PreparedColumns {
  headerCells: string[];
  hasHeaderRow: boolean;
  dataLines: string[][];
  mapping: ColumnMapping[];
}

/** Accepts CSV (comma-separated) or a pasted range from Excel/Sheets (tab-separated).
 * Detects a header row when at least one cell in the first line guesses to a known
 * field; otherwise treats every line as data and falls back to name, trade, phone,
 * email, endorsement column order. Either way, the caller lets the user confirm/edit
 * the guessed mapping before rows are built. */
function prepareColumns(raw: string): PreparedColumns | null {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const splitLine = (l: string) => splitDelimited(l, delimiter);

  const firstCells = splitLine(lines[0]);
  const hasHeaderRow = firstCells.some((c) => guessField(c) !== "ignore");
  const dataLines = (hasHeaderRow ? lines.slice(1) : lines).map(splitLine);
  const colCount = Math.max(firstCells.length, ...dataLines.map((c) => c.length), 1);
  const headerCells = hasHeaderRow
    ? firstCells
    : Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
  const fallbackOrder: ColumnMapping[] = ["name", "trade", "phone", "email", "endorsement"];
  const mapping = headerCells.map((h, i) => (hasHeaderRow ? guessField(h) : fallbackOrder[i] ?? "ignore"));

  return { headerCells, hasHeaderRow, dataLines, mapping };
}

function buildRows(dataLines: string[][], mapping: ColumnMapping[]): ParsedRow[] {
  return dataLines.map((cells) => {
    const row: ParsedRow = { name: "", trade: "", phone: "", email: "", endorsement: "", tags: [] };
    mapping.forEach((field, i) => {
      if (field !== "ignore" && cells[i] !== undefined) row[field] = cells[i];
    });
    // Default tag: the category/trade column, so pros are searchable by trade out of the box.
    if (row.trade) row.tags = [row.trade];
    return row;
  }).filter((r) => r.name || r.phone || r.email);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 10;
}

function isRowGood(row: ParsedRow): boolean {
  return !!row.name.trim() && (isValidEmail(row.email) || isValidPhone(row.phone));
}

// ── Sortable header ──────────────────────────────────────────────────────
type SortKey = "valid" | "name" | "trade" | "phone" | "email";
type SortDir = "asc" | "desc";

function SortTh({
  col, sortKey, sortDir, onSort, children, minWidth,
}: {
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const active = sortKey === col;
  return (
    <Table.Th
      style={{
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth,
        background: active ? "color-mix(in srgb, var(--gk-accent-primary) 14%, transparent)" : undefined,
      }}
      onClick={() => onSort(col)}
    >
      <Group gap={3} wrap="nowrap">
        <span>{children}</span>
        {active ? (
          sortDir === "asc" ? (
            <IconChevronUp size={11} color="var(--gk-accent-primary)" />
          ) : (
            <IconChevronDown size={11} color="var(--gk-accent-primary)" />
          )
        ) : (
          <IconArrowsSort size={10} style={{ opacity: 0.35 }} />
        )}
      </Group>
    </Table.Th>
  );
}

type StatusFilter = "all" | "good" | "attention";

interface Props {
  opened: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function BulkImportProsModal({ opened, onClose, onImported }: Props) {
  const [pasteText, setPasteText] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState<PreparedColumns | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(col); setSortDir("asc"); }
  }

  const displayRows = useMemo(() => {
    let withMeta = (rows ?? []).map((r, idx) => ({ ...r, _idx: idx, _valid: isRowGood(r) }));
    if (statusFilter === "good") withMeta = withMeta.filter((r) => r._valid);
    else if (statusFilter === "attention") withMeta = withMeta.filter((r) => !r._valid);
    if (!sortKey) return withMeta;
    return [...withMeta].sort((a, b) => {
      const cmp = sortKey === "valid"
        ? Number(a._valid) - Number(b._valid)
        : a[sortKey].localeCompare(b[sortKey], undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir, statusFilter]);

  const goodCount = rows ? rows.filter(isRowGood).length : 0;
  const visibleIdx = displayRows.map((r) => r._idx);
  const allVisibleSelected = visibleIdx.length > 0 && visibleIdx.every((i) => selected.has(i));
  const someVisibleSelected = visibleIdx.some((i) => selected.has(i));

  function updateField(idx: number, field: "name" | "trade" | "phone" | "email", value: string) {
    setRows((prev) => prev ? prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)) : prev);
  }

  function updateTags(idx: number, tags: string[]) {
    setRows((prev) => prev ? prev.map((r, i) => (i === idx ? { ...r, tags } : r)) : prev);
  }

  function toggleRowSelected(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIdx.forEach((i) => next.delete(i));
      else visibleIdx.forEach((i) => next.add(i));
      return next;
    });
  }

  function deleteRow(idx: number) {
    setRows((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i !== idx) next.add(i > idx ? i - 1 : i); });
      return next;
    });
  }

  function deleteSelected() {
    setRows((prev) => prev ? prev.filter((_, i) => !selected.has(i)) : prev);
    setSelected(new Set());
  }

  function handleClose() {
    setPasteText("");
    setRows(null);
    setError(null);
    setResult(null);
    setSortKey(null);
    setStatusFilter("all");
    setSelected(new Set());
    setColumns(null);
    setColumnMapping([]);
    onClose();
  }

  function beginMapping(raw: string) {
    const prep = prepareColumns(raw);
    if (!prep || prep.dataLines.length === 0) { setError("Couldn't find any rows to import."); return; }
    setError(null);
    setColumns(prep);
    setColumnMapping(prep.mapping);
  }

  function updateColumnMapping(i: number, value: ColumnMapping) {
    setColumnMapping((prev) => prev.map((m, idx) => (idx === i ? value : m)));
  }

  function backToInput() {
    setColumns(null);
    setColumnMapping([]);
  }

  function confirmMapping() {
    if (!columns) return;
    const built = buildRows(columns.dataLines, columnMapping);
    if (built.length === 0) { setError("None of the mapped columns produced a name, phone, or email — check your mapping."); return; }
    setError(null);
    setRows(built);
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    beginMapping(text);
  }

  async function handleImport() {
    if (!rows) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await communityFetch("/api/me/community/pros/bulk-import", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      const data = await res.json() as { detail?: string; added?: number; skipped?: number };
      if (!res.ok) throw new Error(data.detail ?? "Import failed.");
      setResult({ added: data.added ?? 0, skipped: data.skipped ?? 0 });
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Bulk Import Pros"
      centered
      size="xl"
      styles={{
        content: { border: "2px solid var(--gk-accent-primary)" },
        header: { borderBottom: "3px solid var(--gk-accent-secondary)", paddingBottom: 10 },
        title: { color: "var(--gk-accent-primary)", fontWeight: 700, fontSize: 18 },
      }}
    >
      {result ? (
        <Stack gap="sm">
          <Text size="sm">
            Imported {result.added} pro{result.added === 1 ? "" : "s"}
            {result.skipped ? `, skipped ${result.skipped} duplicate/invalid row${result.skipped === 1 ? "" : "s"}` : ""}.
          </Text>
          <Button size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff", alignSelf: "flex-start" }} onClick={handleClose}>
            Done
          </Button>
        </Stack>
      ) : rows ? (
        <Stack gap="sm">
          <Group justify="space-between" wrap="wrap" gap={6}>
            <Group gap={6}>
              <Text size="sm" c="dimmed">Ready to import {rows.length} pro{rows.length === 1 ? "" : "s"}:</Text>
              <Group gap={4} wrap="nowrap">
                <IconCheck size={14} color="#2f9e44" />
                <Text size="xs" fw={600} c="#2f9e44">{goodCount} look good</Text>
              </Group>
              {goodCount < rows.length && (
                <Group gap={4} wrap="nowrap">
                  <IconAlertCircle size={14} color="var(--gk-accent-secondary)" />
                  <Text size="xs" fw={600} style={{ color: "var(--gk-accent-secondary)" }}>
                    {rows.length - goodCount} need a valid phone or email
                  </Text>
                </Group>
              )}
            </Group>
            <Group gap={8} wrap="nowrap">
              <SegmentedControl
                size="xs"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                data={[
                  { label: "All", value: "all" },
                  { label: "Good", value: "good" },
                  { label: "Needs attention", value: "attention" },
                ]}
              />
              <Button
                size="xs"
                radius="xl"
                variant="light"
                color="red"
                leftSection={<IconTrash size={13} />}
                disabled={selected.size === 0}
                onClick={deleteSelected}
              >
                Delete{selected.size ? ` (${selected.size})` : ""}
              </Button>
            </Group>
          </Group>
          <div style={{ maxHeight: 340, overflow: "auto", border: "1px solid var(--gk-border)", borderRadius: 8 }}>
            <Table withRowBorders={false} highlightOnHover style={{ minWidth: 760 }}>
              <Table.Thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "color-mix(in srgb, var(--gk-accent-primary) 10%, var(--gk-bg-surface))",
                }}
              >
                <Table.Tr>
                  <Table.Th style={{ minWidth: 32 }}>
                    <Checkbox
                      size="xs"
                      checked={allVisibleSelected}
                      indeterminate={someVisibleSelected && !allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all visible rows"
                    />
                  </Table.Th>
                  <SortTh col="valid" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} minWidth={40}>✓</SortTh>
                  <SortTh col="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} minWidth={130}>Name</SortTh>
                  <SortTh col="trade" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} minWidth={110}>Trade</SortTh>
                  <SortTh col="phone" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} minWidth={120}>Phone</SortTh>
                  <SortTh col="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} minWidth={160}>Email</SortTh>
                  <Table.Th style={{ minWidth: 180 }}>Tags</Table.Th>
                  <Table.Th style={{ minWidth: 32 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayRows.map((r, i) => (
                  <Table.Tr
                    key={r._idx}
                    style={{
                      background: i % 2 === 1 ? "color-mix(in srgb, var(--gk-accent-primary) 5%, transparent)" : "transparent",
                    }}
                  >
                    <Table.Td>
                      <Checkbox
                        size="xs"
                        checked={selected.has(r._idx)}
                        onChange={() => toggleRowSelected(r._idx)}
                        aria-label={`Select ${r.name || "row"}`}
                      />
                    </Table.Td>
                    <Table.Td>
                      {r._valid ? (
                        <Tooltip label="Looks good">
                          <IconCheck size={16} color="#2f9e44" />
                        </Tooltip>
                      ) : (
                        <Tooltip label="Needs a valid phone or email">
                          <IconAlertCircle size={16} color="var(--gk-accent-secondary)" />
                        </Tooltip>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <TextInput size="xs" variant="unstyled" placeholder="—" value={r.name}
                        onChange={(e) => updateField(r._idx, "name", e.currentTarget.value)} />
                    </Table.Td>
                    <Table.Td>
                      <TextInput size="xs" variant="unstyled" placeholder="—" value={r.trade}
                        onChange={(e) => updateField(r._idx, "trade", e.currentTarget.value)} />
                    </Table.Td>
                    <Table.Td>
                      <TextInput size="xs" variant="unstyled" placeholder="—" value={r.phone}
                        onChange={(e) => updateField(r._idx, "phone", e.currentTarget.value)} />
                    </Table.Td>
                    <Table.Td>
                      <TextInput size="xs" variant="unstyled" placeholder="—" value={r.email}
                        onChange={(e) => updateField(r._idx, "email", e.currentTarget.value)} />
                    </Table.Td>
                    <Table.Td>
                      <TagsInput
                        size="xs"
                        placeholder="Add tag"
                        value={r.tags}
                        onChange={(tags) => updateTags(r._idx, tags)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Delete row">
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteRow(r._idx)} aria-label="Delete row">
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Group justify="flex-end">
            <Button variant="subtle" size="xs" radius="xl" onClick={() => setRows(null)}>Back to Mapping</Button>
            <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void handleImport()}>
              Import {rows.length} Pro{rows.length === 1 ? "" : "s"}
            </Button>
          </Group>
        </Stack>
      ) : columns ? (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {columns.hasHeaderRow
              ? "We matched your columns to fields below — adjust any that aren't right."
              : "No header row detected — tell us what each column is."}
          </Text>
          <div style={{ maxHeight: 340, overflow: "auto", border: "1px solid var(--gk-border)", borderRadius: 8 }}>
            <Table withRowBorders={false}>
              <Table.Thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "color-mix(in srgb, var(--gk-accent-primary) 10%, var(--gk-bg-surface))",
                }}
              >
                <Table.Tr>
                  <Table.Th>Column</Table.Th>
                  <Table.Th>Sample</Table.Th>
                  <Table.Th style={{ minWidth: 190 }}>Maps to</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {columns.headerCells.map((h, i) => (
                  <Table.Tr
                    key={i}
                    style={{
                      background: i % 2 === 1 ? "color-mix(in srgb, var(--gk-accent-primary) 5%, transparent)" : "transparent",
                    }}
                  >
                    <Table.Td><Text size="sm" fw={600}>{h}</Text></Table.Td>
                    <Table.Td><Text size="xs" c="dimmed" truncate="end" maw={220}>{columns.dataLines[0]?.[i] || "—"}</Text></Table.Td>
                    <Table.Td>
                      <Select
                        size="xs"
                        allowDeselect={false}
                        data={TARGET_FIELD_OPTIONS}
                        value={columnMapping[i]}
                        onChange={(v) => v && updateColumnMapping(i, v as ColumnMapping)}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Group justify="flex-end">
            <Button variant="subtle" size="xs" radius="xl" onClick={backToInput}>Back</Button>
            <Button size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={confirmMapping}>
              Continue
            </Button>
          </Group>
        </Stack>
      ) : (
        <Tabs defaultValue="paste">
          <Tabs.List>
            <Tabs.Tab value="paste">Paste Rows</Tabs.Tab>
            <Tabs.Tab value="csv">Upload CSV</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="paste" pt="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Paste rows copied from Excel/Sheets, or comma-separated values, with any headers you like (e.g. "Vendor Name", "Category") —
                you'll get to match each column to a field next.
              </Text>
              <Textarea
                placeholder={"Category, Vendor Name, Vendor Company, Phone, Email, Comments\nPlumbing, John Doe, John's Plumbing, 555-123-4567, john@example.com, Reliable"}
                minRows={8}
                autosize
                value={pasteText}
                onChange={(e) => setPasteText(e.currentTarget.value)}
              />
              {error && <Alert color="red" variant="light">{error}</Alert>}
              <Group justify="flex-end">
                <Button variant="subtle" size="xs" radius="xl" onClick={handleClose}>Cancel</Button>
                <Button size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }}
                  disabled={!pasteText.trim()} onClick={() => beginMapping(pasteText)}>
                  Map Columns
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="csv" pt="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Upload a CSV with any columns — you'll get to match each one to a field next.
                For an .xls/.xlsx file, save it as CSV first or paste the rows directly on the other tab.
              </Text>
              <FileButton onChange={(f) => void handleFile(f)} accept=".csv,.txt">
                {(props) => (
                  <Button {...props} size="xs" radius="xl" leftSection={<IconUpload size={14} />} variant="light">
                    Choose CSV File
                  </Button>
                )}
              </FileButton>
              {error && <Alert color="red" variant="light">{error}</Alert>}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      )}
    </Modal>
  );
}
