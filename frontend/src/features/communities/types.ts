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
  // Popularity/Quality-of-Work card metrics — design-specs/11.ContactCardUpdate.md.
  popularity_score: number | null;
  quality_score: number | null;
  recommended_count: number;
  used_count: number;
  review_count: number;
  schedule_adherence_pct: number | null;
  professionalism_cleanliness_pct: number | null;
  pricing_transparency_pct: number | null;
  communication_quality_pct: number | null;
  rehire_intent_pct: number | null;
  // Set when this pro was suggested by a Member (design-specs/13.RecommendAPro-LandingIntent.md
  // §5) — the endorsement should attribute to this name instead of the Lead.
  submitted_by_name: string | null;
  // True when the logged-in viewer owns, hired, or reviewed this pro — powers the "Self" filter.
  is_related_to_viewer: boolean;
}

/** A Member-submitted pro suggestion awaiting Owner/Moderator approval —
 * design-specs/13.RecommendAPro-LandingIntent.md §4. */
export interface PendingProRecommendationOut {
  id: number;
  name: string;
  trade: string;
  phone: string;
  email: string;
  url: string;
  endorsement: string;
  submitted_by_name: string;
  created_at: string;
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
  pending_approval: boolean;
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
  link_copy_count: number;
  viewer_status: "owner" | "moderator" | "member" | "pending" | "none" | null;
  pros: CommunityProOut[];
}

export interface CommunityMemberOut {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: "invited" | "pending" | "joined" | "declined";
  role: "member" | "moderator";
  click_count: number;
  invited_at: string;
  joined_at: string | null;
  last_resent_at: string | null;
  avatar_url: string | null;
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
