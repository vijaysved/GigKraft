import { Alert, Divider, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconUserOff } from "@tabler/icons-react";

import type { CircleProOut, CircleSearchResultOut } from "../types";
import { CirclePublicProCard } from "./CirclePublicProCard";

interface Props {
  results: CircleSearchResultOut[];
  searching: boolean;
  circleName: string;
  slug: string;
  showTier2Prompt?: boolean;
}

const TIER_SECTION_LABEL: Record<number, (name: string) => string> = {
  1: (name) => `Vouched by ${name}`,
  2: () => "Used by Your Connections",
  3: () => "Gigkraft Verified",
};

function toProOut(r: CircleSearchResultOut): CircleProOut {
  return {
    id: r.circle_pro_id ?? r.pro_id ?? 0,
    pro_id: r.pro_id,
    display_name: r.display_name,
    primary_trade: r.primary_trade,
    avatar_url: r.avatar_url,
    handle: null,
    bio: null,
    off_platform_phone: null,
    off_platform_email: null,
    phone: null,
    email: null,
    zip_code: null,
    endorsement: r.endorsement ?? "",
    status: r.status,
    is_off_platform: r.is_off_platform,
    skill_tags: [],
    krafts_verified: 0,
    recs_approved: 0,
    circles_count: 0,
  };
}

export function CircleSearchResults({
  results,
  searching,
  circleName,
  slug,
  showTier2Prompt,
}: Props) {
  if (searching) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <Loader size="sm" />
        <Text c="dimmed" size="sm">Searching…</Text>
      </Stack>
    );
  }

  if (!results.length) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <IconUserOff size={32} color="gray" />
        <Text c="dimmed" ta="center">
          No pros found for this task in {circleName}'s Circle or nearby.
        </Text>
        <Text c="dimmed" size="xs">Try a different description.</Text>
      </Stack>
    );
  }

  const tiers = [1, 2, 3] as const;

  return (
    <Stack gap="lg">
      {tiers.map((tier) => {
        const tierResults = results.filter((r) => r.tier === tier);
        const showThis = tierResults.length > 0 || (tier === 2 && showTier2Prompt);
        if (!showThis) return null;

        return (
          <Stack key={tier} gap="sm">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              {TIER_SECTION_LABEL[tier](circleName)}
            </Text>
            {tier === 2 && tierResults.length === 0 && showTier2Prompt && (
              <Alert variant="light" color="blue">
                Log in to see who your connections recommend.
              </Alert>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
              {tierResults.map((r) => (
                <CirclePublicProCard
                  key={`${tier}-${r.pro_id ?? r.circle_pro_id}`}
                  cp={toProOut(r)}
                  slug={slug}
                  curatorName={circleName}
                />
              ))}
            </SimpleGrid>
            <Divider />
          </Stack>
        );
      })}
    </Stack>
  );
}
