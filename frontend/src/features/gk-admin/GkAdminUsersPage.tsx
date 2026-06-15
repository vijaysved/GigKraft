import {
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  ApiError,
  getGkUsers,
  type GkUserRow,
} from "../../api/endpoints";

const ROLE_COLORS: Record<string, string> = {
  pro: "blue",
  homeowner: "green",
  node_manager: "orange",
  gk_admin: "violet",
};

export function GkAdminUsersPage() {
  const [users, setUsers] = useState<GkUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const rows = await getGkUsers(roleFilter || undefined, search || undefined);
        if (!cancelled) setUsers(rows);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load users.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [roleFilter, search]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>All Users</Title>
        <Badge color="violet" variant="filled" size="sm">{users?.length ?? "…"} shown</Badge>
      </Group>

      {error && <Alert color="red" variant="light">{error}</Alert>}

      <Group>
        <TextInput
          placeholder="Search by email…"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="All roles"
          clearable
          data={[
            { value: "pro", label: "Pro" },
            { value: "homeowner", label: "Homeowner" },
            { value: "node_manager", label: "Node Manager" },
          ]}
          value={roleFilter}
          onChange={(v) => setRoleFilter(v ?? "")}
          w={160}
        />
      </Group>

      <Card withBorder radius="md" padding="lg">
        {users ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email / Phone</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Node</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text size="sm" c="dimmed">No users match.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                      #{u.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{u.email ?? u.phone ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={ROLE_COLORS[u.role] ?? "gray"} size="xs" variant="light">
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" style={{ fontFamily: "var(--mantine-font-family-monospace)" }}>
                      {u.node_id ?? "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={u.is_active ? "green" : "red"} size="xs" variant="dot">
                      {u.is_active ? "active" : "inactive"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Loader size="sm" />
        )}
      </Card>
    </Stack>
  );
}
