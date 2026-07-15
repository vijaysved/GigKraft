import { Alert, Button, FileButton, Group, Modal, Stack, Tabs, Text, TextInput } from "@mantine/core";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useState } from "react";

interface Row { name: string; phone: string; email: string }

interface Props {
  opened: boolean;
  onClose: () => void;
  onAddManual: (rows: Row[]) => Promise<{ added?: number; skipped?: number }>;
  onUploadCsv: (file: File) => Promise<{ added?: number; skipped?: number }>;
}

export function AddMembersModal({ opened, onClose, onAddManual, onUploadCsv }: Props) {
  const [rows, setRows] = useState<Row[]>([{ name: "", phone: "", email: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ added?: number; skipped?: number } | null>(null);

  function updateRow(i: number, field: keyof Row, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { name: "", phone: "", email: "" }]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  function handleClose() {
    setRows([{ name: "", phone: "", email: "" }]);
    setError(null);
    setResult(null);
    onClose();
  }

  async function handleManualSubmit() {
    const valid = rows.filter((r) => r.name.trim() && (r.phone.trim() || r.email.trim()));
    if (valid.length === 0) {
      setError("Add at least one member with a name and phone or email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const out = await onAddManual(valid);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const out = await onUploadCsv(file);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Add Members" centered size="lg">
      {result ? (
        <Stack gap="sm">
          <Text size="sm">Added {result.added ?? 0} member(s){result.skipped ? `, skipped ${result.skipped} duplicate(s)/invalid row(s)` : ""}.</Text>
          <Button fullWidth size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={handleClose}>Done</Button>
        </Stack>
      ) : (
        <Tabs defaultValue="manual">
          <Tabs.List>
            <Tabs.Tab value="manual">Manual entry</Tabs.Tab>
            <Tabs.Tab value="csv">Upload CSV</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="manual" pt="md">
            <Stack gap="sm">
              {rows.map((row, i) => (
                <Group key={i} align="flex-end" wrap="nowrap">
                  <TextInput label={i === 0 ? "Name" : undefined} placeholder="Name" value={row.name}
                    onChange={(e) => updateRow(i, "name", e.currentTarget.value)} style={{ flex: 1 }} />
                  <TextInput label={i === 0 ? "Phone" : undefined} placeholder="Phone" value={row.phone}
                    onChange={(e) => updateRow(i, "phone", e.currentTarget.value)} style={{ flex: 1 }} />
                  <TextInput label={i === 0 ? "Email" : undefined} placeholder="Email" value={row.email}
                    onChange={(e) => updateRow(i, "email", e.currentTarget.value)} style={{ flex: 1 }} />
                  {rows.length > 1 && (
                    <Button variant="subtle" color="red" size="xs" px={6} onClick={() => removeRow(i)}><IconTrash size={16} /></Button>
                  )}
                </Group>
              ))}
              <Button variant="light" size="xs" radius="xl" onClick={addRow}>+ Add Another</Button>
              {error && <Alert color="red" variant="light">{error}</Alert>}
              <Group justify="flex-end">
                <Button variant="subtle" size="xs" radius="xl" onClick={handleClose}>Cancel</Button>
                <Button loading={submitting} size="xs" radius="xl" style={{ background: "var(--gk-accent-secondary)", color: "#fff" }} onClick={() => void handleManualSubmit()}>
                  Add Members
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="csv" pt="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Upload a CSV with <code>name</code>, <code>phone</code>, and/or <code>email</code> columns.
              </Text>
              <FileButton onChange={(f) => void handleFile(f)} accept=".csv">
                {(props) => (
                  <Button {...props} loading={submitting} size="xs" radius="xl" leftSection={<IconUpload size={16} />} variant="light">
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
