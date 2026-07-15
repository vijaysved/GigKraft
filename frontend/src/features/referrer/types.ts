export interface ProCardOut {
  id: number;
  linked_pro_id: number | null;
  name: string;
  trade: string;
  city: string;
  phone: string;
  email: string;
  avatar_url: string;
  endorsement: string;
  tags: string[];
  responds_in: string | null;
  is_licensed: boolean;
  is_insured: boolean;
  is_on_platform: boolean;
  is_pending: boolean;
  tap_to_call: boolean;
  request_status: string | null;
  short_url: string;
  click_count: number | null;
}

export interface FollowerState {
  follower_id: number;
  name: string;
}

export interface ReferrerPublicOut {
  slug: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  follower_count: number;
  referral_count: number;
  pros: ProCardOut[];
  follower_state: FollowerState | null;
  is_owner: boolean;
  phone?: string;
  email?: string;
  short_url: string;
  link_click_count: number | null;
}

export interface ReferrerProfileOut {
  slug: string;
  bio: string;
  avatar_url: string;
  default_zip: string;
  page_url: string;
  short_url: string;
  link_click_count: number;
}

export interface ReferrerStatsOut {
  follower_count: number;
  pending_request_count: number;
  referral_count: number;
}

export interface ReferrerDashboardOut {
  profile: ReferrerProfileOut;
  stats: ReferrerStatsOut;
}

export interface ReferralRequestDetailOut {
  id: number;
  follower_name: string;
  follower_phone: string;
  pro_name: string | null;
  pro_trade: string | null;
  job_description: string;
  status: string;
  created_at: string;
}

export interface FollowerOut {
  id: number;
  name: string;
  phone: string;
  email: string;
  followed_at: string;
  referrals_received: number;
}

export interface ReferralSentSummaryOut {
  id: number;
  follower_name: string;
  pro_name: string;
  sent_at: string;
}

export interface InviteListProOut {
  invite_id: number;
  name: string;
  trade: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  click_count: number;
  email_count: number;
  whatsapp_count: number;
  sms_count: number;
  invited_at: string;
  last_resent_at: string | null;
}

export interface InviteListFriendOut {
  invite_id: number;
  name: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  click_count: number;
  email_count: number;
  whatsapp_count: number;
  sms_count: number;
  invited_at: string;
  last_resent_at: string | null;
}

export interface InviteListCircleOut {
  invite_id: number;
  name: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  click_count: number;
  email_count: number;
  whatsapp_count: number;
  sms_count: number;
  invited_at: string;
  last_resent_at: string | null;
}

export interface InviteListOut {
  pro_invites: InviteListProOut[];
  friend_invites: InviteListFriendOut[];
  circle_invites: InviteListCircleOut[];
}

export type InviteScenario = "pro" | "friend" | "circle";

export interface InviteTimelineEventOut {
  event_type: "sent" | "resent" | "opened" | "clicked" | "joined";
  channel: string | null;
  message_body: string | null;
  occurred_at: string;
}
