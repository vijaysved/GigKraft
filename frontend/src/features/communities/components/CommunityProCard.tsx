import { Text } from "@mantine/core";
import { IconPlugConnected } from "@tabler/icons-react";

import { CollapsibleTags } from "../../../components/CollapsibleTags";
import { ProviderCard, type ProviderCardFavorite } from "../../../components/ProviderCard";
import type { CommunityProOut } from "../types";

interface Props {
  pro: CommunityProOut;
  disabled: boolean;
  leadName?: string;
  onRequest: (pro: CommunityProOut) => void;
  onTagClick: (tag: string) => void;
  favorite?: ProviderCardFavorite;
  blurred?: boolean;
}

export function CommunityProCard({ pro, disabled, leadName, onRequest, onTagClick, favorite, blurred }: Props) {
  return (
    <ProviderCard
      avatarUrl={pro.avatar_url}
      avatarSeed={pro.id}
      name={pro.display_name}
      tier={pro.is_off_platform ? "referred" : "pro"}
      trade={pro.trade}
      inlineTrade
      phone={pro.phone}
      email={pro.email}
      favorite={pro.pro_id != null ? favorite : undefined}
      blurred={blurred}
      topRightAction={
        <button
          onClick={() => onRequest(pro)}
          disabled={disabled}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "transparent",
            padding: 0,
            fontFamily: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <IconPlugConnected size={11} color="var(--gk-accent-primary)" style={{ flexShrink: 0 }} />
          <Text size="xs" fw={700} c="var(--gk-accent-primary)">Connect</Text>
        </button>
      }
    >
      {pro.endorsement && (
        <Text size="xs" fs="italic" c="dimmed" lineClamp={2} mb={4} style={{ position: "relative", zIndex: 1 }}>
          "{pro.endorsement}"{leadName ? ` — ${leadName}` : ""}
        </Text>
      )}

      <CollapsibleTags tags={pro.tags} onTagClick={onTagClick} />
    </ProviderCard>
  );
}
