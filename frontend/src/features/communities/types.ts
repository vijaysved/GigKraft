export interface CommunityProOut {
  id: number;
  pro_id: number | null;
  display_name: string;
  trade: string;
  avatar_url: string | null;
  handle: string | null;
  endorsement: string;
  tags: string[];
  is_off_platform: boolean;
  phone: string | null;
  email: string | null;
}

/** A Lead's personal-page pro, annotated against one specific Community.
 * `on_this_community` reflects real linkage (ReferrerPro.community == this
 * community) — NOT the same as ReferrerPro.show_on_community, which defaults
 * to true on every pro regardless of whether it's ever been added to any
 * community at all. */
export interface CommunityProCandidateOut {
  id: number;
  name: string;
  trade: string;
  phone: string;
  email: string;
  avatar_url: string;
  endorsement: string;
  tags: string[];
  is_on_platform: boolean;
  on_this_community: boolean;
}

export interface CommunityOut {
  slug: string;
  name: string;
  description: string;
  cover_image_url: string;
  theme: string;
  lead_name: string;
  lead_avatar_url: string | null;
  status: "active" | "archived";
  is_read_only: boolean;
  is_publicly_visible: boolean;
  pro_count: number;
  member_count: number;
  page_views: number;
  viewer_status: "owner" | "moderator" | "member" | "none" | null;
  pros: CommunityProOut[];
}

export interface CommunityMemberOut {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: "invited" | "joined" | "declined";
  role: "member" | "moderator";
  click_count: number;
  invited_at: string;
  joined_at: string | null;
  last_resent_at: string | null;
}

export interface ManagedCommunityOut {
  slug: string;
  name: string;
  description: string;
  cover_image_url: string;
  theme: string;
  status: "active" | "archived";
  is_read_only: boolean;
  viewer_role: "owner" | "moderator";
  short_code: string;
  short_link_click_count: number;
}

export interface CommunityAnalyticsOut {
  page_views: number;
  requests_submitted: number;
  member_count: number;
  invited_count: number;
  joined_count: number;
  pro_count: number;
}

export interface CommunitySubscriptionStatusOut {
  has_community: boolean;
  has_active_subscription: boolean;
  community_slug: string | null;
  plan: string | null;
  status: string | null;
  stripe_mode: string;
}

export interface CommunityInvoiceOut {
  id: number;
  amount: number;
  status: string;
  period_label: string;
  issued_at: string;
}

export interface CommunityBillingOut {
  plan: string | null;
  plan_label: string | null;
  status: string | null;
  renews_at: string | null;
  card_last4: string;
  monthly_value: number | null;
  invoices: CommunityInvoiceOut[];
}
