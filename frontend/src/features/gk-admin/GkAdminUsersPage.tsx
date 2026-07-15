import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Loader,
  Modal,
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
import { IconExternalLink, IconSearch, IconShieldFilled, IconTrash, IconUserCog, IconUserOff } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import {
  ApiError,
  deleteGkUser,
  getGkUserZipcodes,
  getGkUsers,
  setGkUserAdmin,
  setGkUserRoles,
  setGkUserVisitor,
  type GkUserRow,
} from "../../api/endpoints";
import { formatPhone } from "../../utils/format";

const ROLE_COLORS: Record<string, string> = {
  visitor: "gray",
  member: "cyan",
  pro: "blue",
  homeowner: "green",
  referrer: "teal",
  community_lead: "grape",
  node_manager: "orange",
  gk_admin: "violet",
};

// Roles a person can hold in any combination — mirrors CAPABILITY_ROLES in
// backend/common/gk_admin_api.py. gk_admin/node_manager/visitor stay as
// separate exclusive actions since those reset or grant platform-level access.
const CAPABILITY_ROLES = [
  { value: "member", label: "Member" },
  { value: "pro", label: "Pro" },
  { value: "homeowner", label: "Homeowner" },
  { value: "referrer", label: "Referrer" },
  { value: "community_lead", label: "Community Owner" },
];

const PAGE_SIZE = 25;

function RolesEditModal({
  user,
  onClose,
  onSave,
}: {
  user: GkUserRow | null;
  onClose: () => void;
  onSave: (userId: number, roles: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const current = [user.role, ...user.extra_roles];
      setSelected(CAPABILITY_ROLES.map((r) => r.value).filter((v) => current.includes(v)));
    }
  }, [user]);

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await onSave(user.id, selected);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={user !== null} onClose={onClose} title="Edit roles" centered size="sm">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {user?.email ?? user?.phone} can hold any combination of these — e.g. Pro + Referrer + Community Owner at once.
        </Text>
        <Stack gap="xs">
          {CAPABILITY_ROLES.map((r) => (
            <Checkbox
              key={r.value}
              label={r.label}
              checked={selected.includes(r.value)}
              onChange={() => toggle(r.value)}
            />
          ))}
        </Stack>
        <Group justify="flex-end">
          <Button variant="default" size="xs" onClick={onClose}>Cancel</Button>
          <Button size="xs" loading={saving} onClick={() => void handleSave()}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

const PROMOTE_TO_ADMIN_EMAILS = new Set(["karrys@gmail.com", "oddlynicellc@gmail.com", "vijaysarkarvedula@gmail.com"]);

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
  const [pendingDelete, setPendingDelete] = useState<GkUserRow | null>(null);
  const [rolesEditUser, setRolesEditUser] = useState<GkUserRow | null>(null);

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

  async function confirmDelete() {
    if (!pendingDelete) return;
    const u = pendingDelete;
    setPendingDelete(null);
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

  async function handleSetVisitor(u: GkUserRow) {
    if (!confirm(`Set ${u.email ?? u.phone} as visitor? This removes their member, pro, and homeowner roles.`)) return;
    try {
      const updated = await setGkUserVisitor(u.id);
      setUsers((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
    } catch {
      setError("Failed to set visitor role.");
    }
  }

  async function handleSaveRoles(userId: number, roles: string[]) {
    try {
      const updated = await setGkUserRoles(userId, roles);
      setUsers((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
      setRolesEditUser(null);
    } catch {
      setError("Failed to update roles.");
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
            { value: "visitor", label: "Visitor" },
            { value: "pro", label: "Pro" },
            { value: "homeowner", label: "Homeowner" },
            { value: "referrer", label: "Referrer" },
            { value: "community_lead", label: "Community Owner" },
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
                      <Text size="sm">{u.email ?? (u.phone ? formatPhone(u.phone) : "—")}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="wrap">
                        <Badge color={ROLE_COLORS[u.role] ?? "gray"} size="xs" variant="filled">
                          {u.role}
                        </Badge>
                        {u.extra_roles.map((r) => (
                          <Badge key={r} color={ROLE_COLORS[r] ?? "gray"} size="xs" variant="light">
                            {r}
                          </Badge>
                        ))}
                      </Group>
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
                        {u.role !== "gk_admin" && u.role !== "node_manager" && (
                          <Tooltip label="Edit roles" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="indigo"
                              onClick={() => setRolesEditUser(u)}
                            >
                              <IconUserCog size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {u.role !== "gk_admin" && u.role !== "node_manager" && u.role !== "visitor" && (
                          <Tooltip label="Set as visitor" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="gray"
                              onClick={() => void handleSetVisitor(u)}
                            >
                              <IconUserOff size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip label="Delete user" withArrow>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="red"
                            onClick={() => setPendingDelete(u)}
                          >
                            <IconTrash size={13} />
                          </ActionIcon>
                        </Tooltip>
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

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete user"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Permanently delete <strong>{pendingDelete?.email ?? pendingDelete?.phone}</strong>?
          </Text>
          <Text size="xs" c="dimmed">
            This removes all their data — profile, leads, messages, circles, billing history, and
            waitlist/prospect records. Their auth tokens are invalidated immediately. This cannot
            be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" size="xs" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button color="red" size="xs" onClick={() => void confirmDelete()}>
              Delete permanently
            </Button>
          </Group>
        </Stack>
      </Modal>

      <RolesEditModal
        user={rolesEditUser}
        onClose={() => setRolesEditUser(null)}
        onSave={handleSaveRoles}
      />
    </Stack>
  );
}
