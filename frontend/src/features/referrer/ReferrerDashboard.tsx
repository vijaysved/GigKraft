import { Tabs } from "@mantine/core";

import { ActivityTab } from "./tabs/ActivityTab";
import { FollowersTab } from "./tabs/FollowersTab";
import { InviteTab } from "./tabs/InviteTab";
import { MyProsTab } from "./tabs/MyProsTab";
import { RequestsTab } from "./tabs/RequestsTab";

export function ReferrerDashboard() {
  return (
    <Tabs defaultValue="my-pros" keepMounted={false}>
      <Tabs.List mb="md">
        <Tabs.Tab value="my-pros">My Pros</Tabs.Tab>
        <Tabs.Tab value="invite">Invite</Tabs.Tab>
        <Tabs.Tab value="requests">Requests</Tabs.Tab>
        <Tabs.Tab value="followers">Followers</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="my-pros"><MyProsTab /></Tabs.Panel>
      <Tabs.Panel value="invite"><InviteTab /></Tabs.Panel>
      <Tabs.Panel value="requests"><RequestsTab /></Tabs.Panel>
      <Tabs.Panel value="followers"><FollowersTab /></Tabs.Panel>
      <Tabs.Panel value="activity"><ActivityTab /></Tabs.Panel>
    </Tabs>
  );
}
