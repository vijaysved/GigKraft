import { Tabs } from "@mantine/core";
import {
  IconActivity,
  IconSearch,
  IconSend,
  IconUserCheck,
  IconUserPlus,
} from "@tabler/icons-react";

import { ActivityTab } from "./tabs/ActivityTab";
import { FollowersTab } from "./tabs/FollowersTab";
import { InviteTab } from "./tabs/InviteTab";
import { RequestsTab } from "./tabs/RequestsTab";
import { SearchTab } from "./tabs/SearchTab";

export function ReferrerDashboard() {
  return (
    <Tabs defaultValue="search" keepMounted={false}>
      <Tabs.List mb="md">
        <Tabs.Tab value="search" leftSection={<IconSearch size={15} />}>Search</Tabs.Tab>
        <Tabs.Tab value="invite" leftSection={<IconUserPlus size={15} />}>Invite</Tabs.Tab>
        <Tabs.Tab value="requests" leftSection={<IconSend size={15} />}>Requests</Tabs.Tab>
        <Tabs.Tab value="followers" leftSection={<IconUserCheck size={15} />}>Followers</Tabs.Tab>
        <Tabs.Tab value="activity" leftSection={<IconActivity size={15} />}>Activity</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="search"><SearchTab /></Tabs.Panel>
      <Tabs.Panel value="invite"><InviteTab /></Tabs.Panel>
      <Tabs.Panel value="requests"><RequestsTab /></Tabs.Panel>
      <Tabs.Panel value="followers"><FollowersTab /></Tabs.Panel>
      <Tabs.Panel value="activity"><ActivityTab /></Tabs.Panel>
    </Tabs>
  );
}
