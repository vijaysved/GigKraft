export interface CircleProOut {
  id: number;
  pro_id: number | null;
  display_name: string;
  primary_trade: string | null;
  avatar_url: string | null;
  handle: string | null;
  bio: string | null;
  off_platform_phone: string | null;
  off_platform_email: string | null;
  phone: string | null;
  email: string | null;
  zip_code: string | null;
  endorsement: string;
  status: "active" | "pending" | "claimed";
  is_off_platform: boolean;
  skill_tags: string[];
  krafts_verified: number;
  recs_approved: number;
  circles_count: number;
}

export interface CircleOut {
  slug: string;
  curator_name: string;
  curator_avatar_url: string | null;
  pro_count: number;
  follow_status: "none" | "pending" | "approved" | "rejected" | "curator" | null;
  pros: CircleProOut[];
}

export interface CircleSearchResultOut {
  tier: 1 | 2 | 3;
  tier_label: string;
  circle_pro_id: number | null;
  pro_id: number | null;
  display_name: string;
  primary_trade: string;
  avatar_url: string | null;
  endorsement: string | null;
  status: "active" | "pending" | "claimed";
  is_off_platform: boolean;
  relevance_score: number;
}

export interface CircleAnalyticsOut {
  page_views: number;
  searches: number;
  requests_submitted: number;
  referrals_attributed: number;
}

export interface CircleFollowRequestOut {
  id: number;
  follower_name: string;
  follower_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// Shared card shape accepted by CircleProCard from both CircleProOut and CircleSearchResultOut
export interface CircleProCardData {
  id: number;
  pro_id: number | null;
  display_name: string;
  primary_trade: string | null;
  avatar_url: string | null;
  endorsement: string | null;
  status: "active" | "pending" | "claimed";
  is_off_platform: boolean;
}
