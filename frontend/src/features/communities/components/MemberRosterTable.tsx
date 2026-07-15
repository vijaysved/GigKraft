import { Badge, Button, Menu, Table, Text } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

import { formatPhone } from "../../../utils/format";
import type { CommunityMemberOut } from "../types";

const STATUS_COLOR: Record<string, string> = {
  invited: "orange",
  joined: "green",
  declined: "gray",
};

interface Props {
  members: CommunityMemberOut[];
  viewerRole: "owner" | "moderator";
  onResend: (id: number) => void;
  onRemove: (id: number) => void;
  onSetRole: (id: number, role: "moderator" | "member") => void;
}

export function MemberRosterTable({ members, viewerRole, onResend, onRemove, onSetRole }: Props) {
  if (members.length === 0) {
    return <Text size="sm" c="dimmed">No members yet — add your first member above.</Text>;
  }

  return (
    <Table withRowBorders striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Contact</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Clicks</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {members.map((m) => (
          <Table.Tr key={m.id}>
            <Table.Td>{m.name}</Table.Td>
            <Table.Td>
              <Text size="xs" c="dimmed">{m.phone ? formatPhone(m.phone) : m.email || "—"}</Text>
            </Table.Td>
            <Table.Td>
              <Badge size="xs" color={STATUS_COLOR[m.status] ?? "gray"} variant="light">{m.status}</Badge>
            </Table.Td>
            <Table.Td>
              {m.role === "moderator" ? <Badge size="xs" color="violet" variant="light">Moderator</Badge> : "—"}
            </Table.Td>
            <Table.Td>{m.click_count}</Table.Td>
            <Table.Td>
              <Menu shadow="md" width={180} position="bottom-end">
                <Menu.Target>
                  <Button variant="subtle" size="xs" px={6}><IconDots size={16} /></Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {m.status === "invited" && (
                    <Menu.Item onClick={() => onResend(m.id)}>Resend Invite</Menu.Item>
                  )}
                  {viewerRole === "owner" && m.status === "joined" && (
                    m.role === "moderator" ? (
                      <Menu.Item onClick={() => onSetRole(m.id, "member")}>Demote to Member</Menu.Item>
                    ) : (
                      <Menu.Item onClick={() => onSetRole(m.id, "moderator")}>Make Moderator</Menu.Item>
                    )
                  )}
                  <Menu.Item color="red" onClick={() => onRemove(m.id)}>Remove</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
