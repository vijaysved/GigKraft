import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconExternalLink, IconSearch, IconShieldFilled, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import {
  ApiError,
  deleteGkUser,
  getGkUserZipcodes,
  getGkUsers,
  setGkUserAdmin,
  type GkUserRow,
} from "../../api/endpoints";

const ROLE_COLORS: Record<string, string> = {
  pro: "blue",
  homeowner: "green",
  node_manager: "orange",
  gk_admin: "violet",
};

const PAGE_SIZE = 25;

const DELETABLE_EMAILS = new Set(["karrys@gmail.com", "satyamanidhruva@gmail.com"]);
const PROMOTE_TO_ADMIN_EMAILS = new Set(["oddlynicellc@gmail.com", "vijaysarkarvedula@gmail.com"]);

export function GkAdminUsersPage() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<GkUserRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [zipFilter, setZipFilter] = useState<string>("");
  const [allZips, setAllZips] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getGkUserZipcodes()
      .then(setAllZips)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, debouncedSearch, zipFilter]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getGkUsers({
          role: roleFilter || undefined,
          search: debouncedSearch || undefined,
          zip: zipFilter || undefined,
          page,
          page_size: PAGE_SIZE,
        });
        if (!cancelled) {
          setUsers(result.items);
          setTotal(result.total);
          setError(null);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load users.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [roleFilter, debouncedSearch, zipFilter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleDelete(u: GkUserRow) {
    if (!confirm(`Delete ${u.email ?? u.phone}? This cannot be undone.`)) return;
    try {
      await deleteGkUser(u.id);
      if (currentUser?.id === u.id) {
        logout();
        navigate("/register", { replace: true });
        return;
      }
      setUsers((prev) => prev?.filter((x) => x.id !== u.id) ?? null);
      setTotal((t) => t - 1);
    } catch {
      setError("Failed to delete user.");
    }
  }

  async function handleSetAdmin(u: GkUserRow) {
    if (!confirm(`Promote ${u.email ?? u.phone} to gk_admin?`)) return;
    try {
      const updated = await setGkUserAdmin(u.id);
      setUsers((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
    } catch {
      setError("Failed to set admin role.");
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>All Users</Title>
        <Badge color="violet" variant="filled" size="sm">
          {total} total
        </Badge>
      </Group>

      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      <Group>
        <TextInput
          placeholder="Search by name or email…"
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
            { value: "gk_admin", label: "GK Admin" },
          ]}
          value={roleFilter}
          onChange={(v) => setRoleFilter(v ?? "")}
          w={160}
        />
      </Group>

      {allZips.length > 0 && (
        <Group gap="xs" wrap="wrap">
          {allZips.map((zip) => (
            <Badge
              key={zip}
              variant={zipFilter === zip ? "filled" : "outline"}
              color={zipFilter === zip ? "blue" : "gray"}
              style={{ cursor: "pointer" }}
              onClick={() => setZipFilter(zipFilter === zip ? "" : zip)}
            >
              {zip}
            </Badge>
          ))}
        </Group>
      )}

      <Card withBorder radius="md" padding="lg">
        {users ? (
          <Stack gap="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th></Table.Th>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email / Phone</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Primary ZIP</Table.Th>
                  <Table.Th>Contact ZIPs</Table.Th>
                  <Table.Th>Node</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Joined</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={11}>
                      <Text size="sm" c="dimmed">
                        No users match.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {users.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>
                      {u.pro_handle && (
                        <Tooltip label="View public profile" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            component="a"
                            href={`/pros/${u.pro_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconExternalLink size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{ fontFamily: "var(--mantine-font-family-monospace)" }}
                      >
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
                      <Badge
                        color={ROLE_COLORS[u.role] ?? "gray"}
                        size="xs"
                        variant="light"
                      >
                        {u.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {u.primary_zip ? (
                        <Badge size="xs" variant="outline" color="teal">
                          {u.primary_zip}
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="wrap">
                        {u.service_zips.length > 0
                          ? u.service_zips.map((z) => (
                              <Badge key={z} size="xs" variant="dot" color="indigo">
                                {z}
                              </Badge>
                            ))
                          : <Text size="xs" c="dimmed">—</Text>}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{ fontFamily: "var(--mantine-font-family-monospace)" }}
                      >
                        {u.node_id ?? "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={u.is_active ? "green" : "red"}
                        size="xs"
                        variant="dot"
                      >
                        {u.is_active ? "active" : "inactive"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {u.date_joined}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        {u.email && PROMOTE_TO_ADMIN_EMAILS.has(u.email) && u.role !== "gk_admin" && (
                          <Tooltip label="Promote to admin" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="violet"
                              onClick={() => void handleSetAdmin(u)}
                            >
                              <IconShieldFilled size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {u.email && DELETABLE_EMAILS.has(u.email) && (
                          <Tooltip label="Delete user" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => void handleDelete(u)}
                            >
                              <IconTrash size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}
          </Stack>
        ) : (
          <Loader size="sm" />
        )}
      </Card>
    </Stack>
  );
}
