import { client } from "./client";
import type { components } from "./generated/types";
import { getAccessToken } from "./tokens";
import type {
  ReferrerDashboardOut,
  ReferralSentSummaryOut,
  FollowerOut,
  ReferralRequestDetailOut,
  InviteListOut,
  InviteListProOut,
  InviteListFriendOut,
  InviteScenario,
  InviteTimelineEventOut,
} from "../features/referrer/types";

export type HealthOut = components["schemas"]["HealthOut"];
export type TokenPairOut = components["schemas"]["TokenPairOut"];
export type AccessTokenOut = components["schemas"]["AccessTokenOut"];
export type UserOut = components["schemas"]["UserOut"];
export type LoginIn = components["schemas"]["LoginIn"];
export type RegisterIn = components["schemas"]["RegisterIn"];
export type MetricsOut = components["schemas"]["MetricsOut"];
export type TriageOut = components["schemas"]["TriageOut"];
export type BroadcastOut = components["schemas"]["BroadcastOut"];
export type KraftOut = components["schemas"]["KraftOut"];
export type KraftPublicOut = components["schemas"]["KraftPublicOut"];
export type ProOut = components["schemas"]["ProOut"];

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
  }
}

function detailOf(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    typeof (error as { detail: unknown }).detail === "string"
  ) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

export async function getHealth(): Promise<HealthOut> {
  const { data, response } = await client.GET("/api/health");
  if (!data) {
    throw new ApiError(response.status, "Health check failed.");
  }
  return data;
}

export async function login(body: LoginIn): Promise<TokenPairOut> {
  const { data, error, response } = await client.POST("/api/auth/login", {
    body,
  });
  if (!data) {
    throw new ApiError(response.status, detailOf(error, "Login failed."));
  }
  return data;
}

export async function register(body: RegisterIn): Promise<TokenPairOut> {
  const { data, error, response } = await client.POST("/api/auth/register", {
    body,
  });
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Registration failed."),
    );
  }
  return data;
}

export async function googleAuth(idToken: string, role = "homeowner"): Promise<TokenPairOut> {
  const { data, error, response } = await client.POST("/api/auth/google", {
    body: { id_token: idToken, role },
  });
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Google sign-in failed."),
    );
  }
  return data;
}

export async function refreshAccessToken(
  refresh: string,
): Promise<AccessTokenOut> {
  const { data, error, response } = await client.POST("/api/auth/refresh", {
    body: { refresh },
  });
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Token refresh failed."),
    );
  }
  return data;
}

export async function getMe(): Promise<UserOut> {
  const { data, response } = await client.GET("/api/me");
  if (!data) {
    throw new ApiError(response.status, "Failed to load profile.");
  }
  return data;
}

export async function patchMe(body: { role?: string; first_name?: string; last_name?: string; phone?: string | null }): Promise<UserOut> {
  const { data, error, response } = await client.PATCH("/api/me", { body });
  if (!data) {
    throw new ApiError(response.status, detailOf(error, "Failed to update profile."));
  }
  return data;
}

export async function patchHomeProfile(body: {
  default_zip?: string;
  preferred_trade?: string;
}): Promise<{ default_zip: string; preferred_trade: string }> {
  const { data, error, response } = await client.PATCH("/api/home/profile" as never, {
    body,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to save profile."));
  return data as { default_zip: string; preferred_trade: string };
}

export async function getAdminMetrics(): Promise<MetricsOut> {
  const { data, error, response } = await client.GET("/api/admin/metrics");
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to load admin metrics."),
    );
  }
  return data;
}

export async function getAdminTriage(): Promise<TriageOut> {
  const { data, error, response } = await client.GET("/api/admin/triage");
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to load triage queue."),
    );
  }
  return data;
}

export async function blastEmergency(id: number): Promise<BroadcastOut> {
  const { data, error, response } = await client.POST(
    "/api/admin/triage/{broadcast_id}/blast",
    { params: { path: { broadcast_id: id } } },
  );
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to blast emergency."),
    );
  }
  return data;
}

export async function pinEmergency(id: number): Promise<BroadcastOut> {
  const { data, error, response } = await client.POST(
    "/api/admin/triage/{broadcast_id}/pin",
    { params: { path: { broadcast_id: id } } },
  );
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to pin emergency."),
    );
  }
  return data;
}

export async function listPendingKrafts(): Promise<KraftOut[]> {
  const { data, error, response } = await client.GET("/api/krafts", {
    params: { query: { status: "pending" } },
  });
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to load Kraft review queue."),
    );
  }
  return data;
}

export async function verifyKraft(id: number): Promise<KraftOut> {
  const { data, error, response } = await client.POST(
    "/api/krafts/{kraft_id}/verify",
    { params: { path: { kraft_id: id } } },
  );
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to verify Kraft."),
    );
  }
  return data;
}

export async function getMyProProfile(): Promise<ProOut> {
  const { data, error, response } = await client.GET("/api/pros/me");
  if (!data) {
    throw new ApiError(response.status, detailOf(error, "Failed to load pro profile."));
  }
  return data;
}

export async function updateHandle(handle: string): Promise<ProOut> {
  const { data, error, response } = await client.PATCH("/api/pros/me/handle", {
    body: { handle },
  });
  if (!data) {
    throw new ApiError(response.status, detailOf(error, "Failed to update handle."));
  }
  return data;
}

export async function getProByHandle(handle: string): Promise<ProOut> {
  const { data, error, response } = await client.GET("/api/pros/by-handle/{handle}", {
    params: { path: { handle } },
  });
  if (!data) {
    throw new ApiError(response.status, detailOf(error, "Pro not found."));
  }
  return data;
}

export interface KraftCreatePayload {
  title: string;
  description?: string;
  skill?: string;
  gig_type?: string;
  location?: string;
  start_month?: number | null;
  start_year?: number | null;
  end_month?: number | null;
  end_year?: number | null;
  photos?: { kind: "before" | "after"; image_url: string; order?: number }[];
}

export async function createKraft(body: KraftCreatePayload): Promise<KraftOut> {
  const { data, error, response } = await client.POST("/api/krafts", { body: body as never });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create Kraft."));
  return data;
}

export async function updateKraft(id: number, body: Partial<KraftCreatePayload>): Promise<KraftOut> {
  const { data, error, response } = await client.PATCH("/api/krafts/{kraft_id}", {
    params: { path: { kraft_id: id } },
    body: body as never,
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update Kraft."));
  return data;
}

export async function publishKraft(id: number): Promise<KraftOut> {
  const { data, error, response } = await client.POST("/api/krafts/{kraft_id}/publish", {
    params: { path: { kraft_id: id } },
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to publish Kraft."));
  return data;
}

export async function listMyKrafts(): Promise<KraftOut[]> {
  const { data, error, response } = await client.GET("/api/krafts", {
    params: { query: { mine: true } },
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load Krafts."));
  return data;
}

export async function getKraftBySlug(slug: string): Promise<KraftOut> {
  const { data, error, response } = await client.GET("/api/krafts/slug/{slug}" as never, {
    params: { path: { slug } },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Kraft not found."));
  return data as KraftOut;
}

export async function getKraftsByPro(proId: number): Promise<KraftPublicOut[]> {
  const { data, error, response } = await client.GET("/api/krafts/by-pro/{pro_id}" as never, {
    params: { path: { pro_id: proId } },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load Krafts."));
  return data as KraftPublicOut[];
}

export async function rejectKraft(id: number, note: string): Promise<KraftOut> {
  const { data, error, response } = await client.POST(
    "/api/krafts/{kraft_id}/reject",
    { params: { path: { kraft_id: id } }, body: { note } },
  );
  if (!data) {
    throw new ApiError(
      response.status,
      detailOf(error, "Failed to reject Kraft."),
    );
  }
  return data;
}

// ---------- GK Admin (cross-node super-admin) ----------

export interface GkNodeSummary {
  node_id: string;
  name: string;
  active_pros: number;
  pending_leads: number;
  monthly_run_rate: number;
  is_active: boolean;
}

export interface GkSiteTrafficRow {
  label: string;
  url: string;
  views_30d: number;
  views_7d: number;
}

export interface GkCampaignMetrics {
  total_sent: number;
  sent_email: number;
  sent_whatsapp: number;
  sent_sms: number;
  emails_opened: number;
  open_rate: number;
  links_clicked: number;
  click_rate: number;
  converted: number;
  conversion_rate: number;
  step_funnel: Record<string, number>;
}

export interface GkPlatformMetrics {
  total_users: number;
  total_pros: number;
  total_homeowners: number;
  total_node_managers: number;
  total_nodes: number;
  active_nodes: number;
  total_krafts: number;
  verified_krafts: number;
  total_leads: number;
  open_leads: number;
  total_subscriptions: number;
  active_subscriptions: number;
  open_infractions: number;
  nodes: GkNodeSummary[];
  site_traffic: GkSiteTrafficRow[];
  campaign: GkCampaignMetrics;
  inbox_unread: number;
  feedback_unread: number;
  new_users_today: number;
}

export interface TemplateProfileData {
  handle: string;
  business_name: string;
  primary_trade: string;
  skill_tags: string[];
  bio: string;
  response_hours: number;
  licensed: boolean;
  license_number: string;
  insured: boolean;
  availability: string;
  wallpaper_id: number;
  wallpaper_url: string;
  avatar_url: string;
  is_verified: boolean;
}

export interface GkUserRow {
  id: number;
  email: string | null;
  phone: string | null;
  role: string;
  first_name: string;
  last_name: string;
  node_id: string | null;
  is_active: boolean;
  date_joined: string;
  primary_zip: string | null;
  service_zips: string[];
  pro_handle: string | null;
}

export interface GkUserList {
  total: number;
  items: GkUserRow[];
}

export async function getGkPlatformMetrics(): Promise<GkPlatformMetrics> {
  const { data, error, response } = await client.GET("/api/gk-admin/metrics" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load platform metrics."));
  return data as GkPlatformMetrics;
}

export async function getGkUsers(opts: {
  role?: string;
  search?: string;
  zip?: string;
  page?: number;
  page_size?: number;
}): Promise<GkUserList> {
  const params: Record<string, string> = {};
  if (opts.role) params.role = opts.role;
  if (opts.search) params.search = opts.search;
  if (opts.zip) params.zip = opts.zip;
  if (opts.page) params.page = String(opts.page);
  if (opts.page_size) params.page_size = String(opts.page_size);
  const { data, error, response } = await client.GET("/api/gk-admin/users" as never, {
    params: { query: params },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load users."));
  return data as GkUserList;
}

export async function getGkUserZipcodes(): Promise<string[]> {
  const { data, error, response } = await client.GET("/api/gk-admin/users/zipcodes" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load zipcodes."));
  return data as string[];
}

export async function deleteGkUser(userId: number): Promise<void> {
  const { response } = await client.DELETE(`/api/gk-admin/users/${userId}` as never);
  if (response.status !== 204 && !response.ok) {
    throw new ApiError(response.status, "Failed to delete user.");
  }
}

export async function setGkUserAdmin(userId: number): Promise<GkUserRow> {
  const { data, error, response } = await client.PATCH(`/api/gk-admin/users/${userId}/set-admin` as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to set admin."));
  return data as GkUserRow;
}

export async function setGkUserVisitor(userId: number): Promise<GkUserRow> {
  const { data, error, response } = await client.PATCH(`/api/gk-admin/users/${userId}/set-visitor` as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to set visitor."));
  return data as GkUserRow;
}

export async function getGkNodes(): Promise<GkNodeSummary[]> {
  const { data, error, response } = await client.GET("/api/gk-admin/nodes" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load nodes."));
  return data as GkNodeSummary[];
}

export interface AnonLeadRow {
  id: number;
  job_title: string;
  detail: string;
  status: string;
  pro_name: string;
  pro_handle: string;
  created_at: string;
}

export async function listAnonymousLeads(): Promise<AnonLeadRow[]> {
  const { data, error, response } = await client.GET("/api/gk-admin/anonymous-leads" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load anonymous leads."));
  return data as AnonLeadRow[];
}

// ---------- Template Profiles ----------

export async function getTemplateProfile(handle: string): Promise<TemplateProfileData> {
  const { data, error, response } = await client.GET(
    `/api/gk-admin/template-profile/${handle}` as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load template profile."));
  return data as TemplateProfileData;
}

export async function updateTemplateProfile(
  handle: string,
  payload: Partial<Omit<TemplateProfileData, "handle">>,
): Promise<TemplateProfileData> {
  const { data, error, response } = await client.PATCH(
    `/api/gk-admin/template-profile/${handle}` as never,
    { body: payload } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update template profile."));
  return data as TemplateProfileData;
}

// ---------- Site Config ----------

export interface SiteConfigData {
  template_pro_url_local: string;
  template_pro_url_prod: string;
  template_member_url_local: string;
  template_member_url_prod: string;
  extra_template_urls: { label: string; url: string }[];
  updated_at: string | null;
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  const { data, error, response } = await client.GET("/api/gk-admin/site-config" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load site configuration."));
  return data as SiteConfigData;
}

export async function updateSiteConfig(
  payload: Omit<SiteConfigData, "updated_at">,
): Promise<SiteConfigData> {
  const { data, error, response } = await client.PUT(
    "/api/gk-admin/site-config" as never,
    { body: payload } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to save site configuration."));
  return data as SiteConfigData;
}

// ---------- Referrer ----------

export interface ReferrerMeOut {
  profile: {
    slug: string;
    bio: string;
    default_zip: string;
    page_url: string;
    slug_locked: boolean;
    notify_email: boolean;
    notify_sms: boolean;
  };
}

export interface ReferrerProRow {
  id: number;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  endorsement: string;
  show_on_page: boolean;
  display_order: number;
  referral_count: number;
  is_on_platform: boolean;
  is_pending: boolean;
  invite_status: string | null;
  added_at: string;
}

export interface FoundProOut {
  user_id: number;
  handle: string;
  name: string;
  trade: string;
  city: string;
  avatar_url: string;
  is_verified: boolean;
  is_pro: boolean;
}

export async function getReferrerMe(): Promise<ReferrerMeOut> {
  const { data, error, response } = await client.GET("/api/referrer/me" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load referrer profile."));
  return data as ReferrerMeOut;
}

export async function getReferrerPros(): Promise<ReferrerProRow[]> {
  const { data, error, response } = await client.GET("/api/referrer/me/pros" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load pros."));
  return data as ReferrerProRow[];
}

export async function updateReferrerPro(
  id: number,
  patch: { show_on_page?: boolean; endorsement?: string },
): Promise<void> {
  const { response } = await client.PATCH(`/api/referrer/me/pros/${id}` as never, { body: patch } as never);
  if (!response.ok) throw new ApiError(response.status, "Failed to update pro.");
}

export async function deleteReferrerPro(id: number): Promise<void> {
  const { response } = await client.DELETE(`/api/referrer/me/pros/${id}` as never);
  if (!response.ok) throw new ApiError(response.status, "Failed to remove pro.");
}

export async function lookupReferrerPro(
  params: { phone?: string; email?: string },
): Promise<FoundProOut | null> {
  const q = new URLSearchParams();
  if (params.phone) q.set("phone", params.phone);
  if (params.email) q.set("email", params.email);
  const { data, response } = await client.GET(
    `/api/referrer/me/pros/lookup?${q.toString()}` as never,
  );
  if (!response.ok || !data) return null;
  return data as FoundProOut;
}

export async function addReferrerPro(
  proHandle: string,
  endorsement?: string,
): Promise<{ ok: boolean; status: number; detail?: string }> {
  const body: Record<string, string> = { pro_handle: proHandle };
  if (endorsement) body.endorsement = endorsement;
  const { error, response } = await client.POST("/api/referrer/me/pros" as never, {
    body,
  } as never);
  return { ok: response.ok, status: response.status, detail: detailOf(error, "") || undefined };
}

export async function inviteReferrerPro(payload: {
  name: string;
  trade: string;
  phone?: string;
  email?: string;
}): Promise<{ ok: boolean; status: number; detail?: string }> {
  const { error, response } = await client.POST("/api/referrer/me/invite-pro" as never, {
    body: payload,
  } as never);
  return { ok: response.ok, status: response.status, detail: detailOf(error, "") || undefined };
}

export async function patchReferrerProfile(patch: {
  slug?: string;
  bio?: string;
  default_zip?: string;
  avatar_url?: string;
  notify_email?: boolean;
  notify_sms?: boolean;
}): Promise<{ ok: boolean; status: number; page_url?: string; slug_locked?: boolean; detail?: string; suggestion?: string }> {
  const { data, error, response } = await client.PATCH("/api/referrer/me/profile" as never, {
    body: patch,
  } as never);
  const body = (data ?? error ?? {}) as Record<string, unknown>;
  return {
    ok: response.ok,
    status: response.status,
    page_url: body.page_url as string | undefined,
    slug_locked: body.slug_locked as boolean | undefined,
    detail: body.detail as string | undefined,
    suggestion: body.suggestion as string | undefined,
  };
}

export async function uploadAvatarFromUrl(url: string): Promise<string> {
  const { data, error, response } = await client.POST("/api/me/avatar-from-url" as never, {
    body: { url },
  } as never);
  if (!response.ok) throw new ApiError(response.status, detailOf(error, "Failed to set avatar."));
  return (data as unknown as { avatar_url: string }).avatar_url;
}

export async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = getAccessToken();
  const res = await fetch("/api/me/avatar", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, "Failed to upload avatar.");
  const { avatar_url } = await res.json() as { avatar_url: string };
  return avatar_url;
}

// ---------- Prospects ----------

export interface StepJourney {
  step: number;
  sent_at: string | null;
  channel: string | null;  // "email" | "whatsapp" | null
  read_at: string | null;  // non-null = email was opened (pixel fired)
  link_clicked_at: string | null;
  example_clicked_at: string | null;  // non-null = recipient viewed the example pro profile
  email_count: number;
  whatsapp_count: number;
}

export interface Prospect {
  id: number;
  prospect_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  primary_zip: string;
  neighborhood: string;
  source: string;
  status: string;
  current_sequence_step: number;
  email_bounced: boolean;
  last_contacted_at: string | null;
  signup_link_token: string;
  link_clicked_at: string | null;
  converted_user_id: number | null;
  notes: string;
  whatsapp_link: string;
  created_at: string;
  updated_at: string;
  journey: StepJourney[];
}

export interface ProspectIn {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  primary_zip?: string;
  neighborhood?: string;
  source?: string;
  status?: string;
  notes?: string;
}

export interface ProspectAnalytics {
  total: number;
  new_7_days: number;
  total_emails_sent: number;
  conversion_rate: number;
  link_ctr: number;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  by_sequence_step: Record<string, number>;
  by_channel: Record<string, number>;
  recent_conversions: Array<{
    id: number;
    name: string;
    source: string;
    converted_user_id: number | null;
    updated_at: string;
  }>;
}

export async function getProspectAnalytics(): Promise<ProspectAnalytics> {
  const { data, error, response } = await client.GET("/api/prospects/analytics" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load analytics."));
  return data as ProspectAnalytics;
}

export async function listProspects(params?: {
  status?: string;
  source?: string;
  search?: string;
}): Promise<Prospect[]> {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.source) query.source = params.source;
  if (params?.search) query.search = params.search;
  const { data, error, response } = await client.GET("/api/prospects" as never, {
    params: { query },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load prospects."));
  return data as Prospect[];
}

export async function getProspect(id: number): Promise<Prospect> {
  const { data, error, response } = await client.GET(`/api/prospects/${id}` as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load prospect."));
  return data as Prospect;
}

export async function getProspectByGkId(gkId: string): Promise<Prospect> {
  const { data, error, response } = await client.GET(`/api/prospects/by-gkid/${gkId}` as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Prospect not found."));
  return data as Prospect;
}

export async function createProspect(body: ProspectIn): Promise<Prospect> {
  const { data, error, response } = await client.POST("/api/prospects" as never, {
    body,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create prospect."));
  return data as Prospect;
}

export async function updateProspect(id: number, body: Partial<ProspectIn & { status: string }>): Promise<Prospect> {
  const { data, error, response } = await client.PATCH(
    `/api/prospects/${id}` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update prospect."));
  return data as Prospect;
}

export async function deleteProspect(id: number): Promise<void> {
  const { response } = await client.DELETE(`/api/prospects/${id}` as never);
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete prospect.");
}

export interface BulkPreviewResult {
  index: number;
  name: string;
  email: string;
  phone: string;
  is_duplicate: boolean;
  existing_id: number | null;
}

export interface BulkPreviewOut {
  total: number;
  new_count: number;
  existing_count: number;
  results: BulkPreviewResult[];
}

export async function checkProspectDuplicates(
  prospects: Array<{ name: string; email: string; phone: string }>,
): Promise<BulkPreviewOut> {
  const { data, error, response } = await client.POST("/api/prospects/bulk-preview" as never, {
    body: { prospects },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to check duplicates."));
  return data as BulkPreviewOut;
}

export async function bulkUpdateProspectStatus(ids: number[], status: string): Promise<Prospect[]> {
  const { data, error, response } = await client.POST(
    "/api/prospects/bulk-status" as never,
    { body: { ids, status } } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Bulk update failed."));
  return data as Prospect[];
}

export async function startProspectSequence(id: number): Promise<Prospect> {
  const { data, error, response } = await client.POST(
    `/api/prospects/${id}/start-sequence` as never,
    {} as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to start sequence."));
  return data as Prospect;
}

export async function advanceProspectStep(id: number, channel: "whatsapp" | "sms" = "whatsapp"): Promise<Prospect> {
  const { data, error, response } = await client.POST(
    `/api/prospects/${id}/advance-step` as never,
    { body: { channel } } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to advance step."));
  return data as Prospect;
}

export async function sendProspectStep(
  id: number,
  step: number,
  channel: "email" | "whatsapp" | "sms",
  isResend = false,
): Promise<Prospect> {
  const { data, error, response } = await client.POST(
    `/api/prospects/${id}/send-step` as never,
    { body: { step, channel, is_resend: isResend } } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to send step."));
  return data as Prospect;
}

export async function trackProPageView(proHandle: string, ref?: string): Promise<void> {
  await client.POST("/api/prospects/track-view" as never, {
    body: { pro_handle: proHandle, ref: ref ?? null },
  } as never);
}

// ---------- Pro Analytics Tracking (fire-and-forget) ----------

export function trackProfileView(proHandle: string): void {
  void fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/pros/track/profile-view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pro_handle: proHandle }),
  }).catch(() => {});
}

export function trackKraftImpression(kraftId: number, proHandle: string): void {
  void fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/pros/track/kraft-impression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kraft_id: kraftId, pro_handle: proHandle }),
  }).catch(() => {});
}

export function trackKraftClick(kraftId: number, proHandle: string): void {
  void fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/pros/track/kraft-click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kraft_id: kraftId, pro_handle: proHandle }),
  }).catch(() => {});
}

// ---------- Pro Dashboard ----------

export interface KraftEngagement {
  kraft_id: number;
  title: string;
  impressions: number;
  clicks: number;
  ctr_pct: number;
}

export interface TimelinePoint {
  label: string;
  visitors: number;
  requests: number;
}

export interface DashboardData {
  range: string;
  joined_at: string;
  total_visitors: number;
  visitors_delta_pct: number;
  neighbors: number;
  neighbors_delta_pct: number;
  project_requests: number;
  requests_delta_pct: number;
  conversion_pct: number;
  timeline: TimelinePoint[];
  krafts: KraftEngagement[];
}

export interface ZipBreakdownRow {
  zip: string;
  visitors: number;
  requests: number;
}

export interface MarketShareData {
  available: boolean;
  pro_count: number;
  required_count: number;
  my_lead_pct: number;
  avg_lead_pct: number;
}

export interface MarketData {
  range: string;
  joined_at: string;
  zip_breakdown: ZipBreakdownRow[];
  market_share: MarketShareData;
}

export async function getProDashboard(range = "30d"): Promise<DashboardData> {
  const { data, error, response } = await client.GET("/api/pros/me/dashboard" as never, {
    params: { query: { range } },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load dashboard."));
  return data as DashboardData;
}

export async function getProMarket(range = "30d"): Promise<MarketData> {
  const { data, error, response } = await client.GET("/api/pros/me/market" as never, {
    params: { query: { range } },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load market data."));
  return data as MarketData;
}


// ---------- Comms — Message Templates ----------

export interface MessageTemplate {
  id: number;
  name: string;
  channel: string;
  kind: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateIn {
  name: string;
  channel: string;
  kind: string;
  subject?: string;
  body: string;
  is_default?: boolean;
}

export async function listTemplates(params?: { channel?: string; kind?: string }): Promise<MessageTemplate[]> {
  const query: Record<string, string> = {};
  if (params?.channel) query.channel = params.channel;
  if (params?.kind) query.kind = params.kind;
  const { data, error, response } = await client.GET("/api/comms/templates" as never, {
    params: { query },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load templates."));
  return data as MessageTemplate[];
}

export async function createTemplate(body: TemplateIn): Promise<MessageTemplate> {
  const { data, error, response } = await client.POST("/api/comms/templates" as never, {
    body,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create template."));
  return (data as { id: number }) as MessageTemplate;
}

export async function updateTemplate(id: number, body: Partial<TemplateIn>): Promise<MessageTemplate> {
  const { data, error, response } = await client.PATCH(
    `/api/comms/templates/${id}` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update template."));
  return data as MessageTemplate;
}

export async function deleteTemplate(id: number): Promise<void> {
  const { response } = await client.DELETE(`/api/comms/templates/${id}` as never);
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete template.");
}

// ---------- Comms — Send Email ----------

export interface SendEmailIn {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  prospect_id?: number;
  template_id?: number;
}

export interface SendEmailOut {
  log_id: number;
  resend_id: string;
}

export async function sendEmail(payload: SendEmailIn): Promise<SendEmailOut> {
  const { data, error, response } = await client.POST("/api/comms/send-email" as never, {
    body: payload,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to send email."));
  return data as SendEmailOut;
}

// ---------- Comms — Outreach Logs ----------

export interface OutreachEvent {
  event_type: "email_open" | "profile_view";
  occurred_at: string;
}

export interface OutreachLog {
  id: number;
  channel: string;
  to_address: string;
  cc_addresses: string;
  subject_sent: string;
  body_sent: string;
  html_body_sent: string;
  resend_id: string;
  notes: string;
  sent_at: string;
  template_id: number | null;
  template_name: string | null;
  read_at: string | null;
  link_clicked_at: string | null;
  example_clicked_at: string | null;
  events: OutreachEvent[];
}

export interface LogIn {
  channel?: string;
  to_address?: string;
  subject_sent?: string;
  body_sent?: string;
  notes?: string;
  template_id?: number | null;
}

export async function listOutreachLogs(prospectId: number): Promise<OutreachLog[]> {
  const { data, error, response } = await client.GET(
    `/api/comms/prospects/${prospectId}/logs` as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load logs."));
  return data as OutreachLog[];
}

export async function addOutreachLog(prospectId: number, body: LogIn): Promise<OutreachLog> {
  const { data, error, response } = await client.POST(
    `/api/comms/prospects/${prospectId}/logs` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to log outreach."));
  return (data as { id: number }) as OutreachLog;
}

export async function deleteOutreachLog(logId: number): Promise<void> {
  const { response } = await client.DELETE(`/api/comms/logs/${logId}` as never);
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete log.");
}

// ── Sovereign Inbox ────────────────────────────────────────────────────────────

export interface InboxParty {
  id: number;
  name: string;
  avatar_url: string;
  role: string;
}

export interface InboxQuoteLineItem {
  label: string;
  amount: number;
}

export interface InboxQuote {
  id: number;
  lead_id: number;
  line_items: InboxQuoteLineItem[];
  total: number;
  accepted: boolean;
  is_invoice: boolean;
  created_at: string;
}

export interface InboxMessage {
  id: number;
  lead_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  is_mine: boolean;
  body: string;
  image_url: string;
  created_at: string;
}

export interface InboxLead {
  id: number;
  job_title: string;
  detail: string;
  status: string;
  thread_type: "lead" | "chat" | "request";
  request_accepted: boolean;
  distance_mi: number | null;
  respond_by: string | null;
  created_at: string;
  homeowner: InboxParty;
  pro: InboxParty | null;
  last_message: string | null;
  unread_hint: number;
  quotes: InboxQuote[];
  circle_referral_slug: string | null;
  circle_referral_curator: string | null;
  is_connected: boolean;
}

export interface CreateLeadPayload {
  pro_id: number;
  job_title: string;
  detail?: string;
  thread_type?: "lead" | "chat" | "request";
}

const LEADS_BASE = "/api/leads";

// openapi-fetch client.GET/POST only accepts paths defined in the generated schema.
// These helpers cast to a generic callable so the leads API (not in schema) can use
// the same auth middleware without adding synthetic OpenAPI paths.
type _Get = (path: string) => Promise<{ data?: unknown; response: Response }>;
type _Post = (path: string, opts?: { body?: unknown }) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
const _get = client.GET as unknown as _Get;
const _post = client.POST as unknown as _Post;

export async function listLeads(params?: {
  status?: string;
  thread_type?: string;
  sent?: boolean;
}): Promise<InboxLead[]> {
  const q: Record<string, string> = {};
  if (params?.status) q.status = params.status;
  if (params?.thread_type) q.thread_type = params.thread_type;
  if (params?.sent) q.sent = "true";
  const qs = Object.keys(q).length ? `?${new URLSearchParams(q).toString()}` : "";
  const { data, response } = await _get(`${LEADS_BASE}${qs}`);
  if (!data) throw new ApiError(response.status, "Failed to load inbox.");
  return data as InboxLead[];
}

export interface ComposePayload {
  handle: string;
  body: string;
  subject?: string;
}

export async function composeMessage(payload: ComposePayload): Promise<InboxLead> {
  const { data, error, response } = await _post(`${LEADS_BASE}/compose`, {
    body: {
      handle: payload.handle.replace(/^@/, ""),
      body: payload.body,
      subject: payload.subject ?? "Direct message",
    },
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to send message."));
  return data as InboxLead;
}

export async function createLead(payload: CreateLeadPayload): Promise<InboxLead> {
  const { data, error, response } = await _post(LEADS_BASE, { body: payload });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create conversation."));
  return data as InboxLead;
}

export async function getLead(leadId: number): Promise<InboxLead> {
  const { data, response } = await _get(`${LEADS_BASE}/${leadId}`);
  if (!data) throw new ApiError(response.status, "Lead not found.");
  return data as InboxLead;
}

export async function listLeadMessages(leadId: number, since = 0): Promise<InboxMessage[]> {
  const qs = since ? `?since=${since}` : "";
  const { data, response } = await _get(`${LEADS_BASE}/${leadId}/messages${qs}`);
  if (!data) throw new ApiError(response.status, "Failed to load messages.");
  return data as InboxMessage[];
}

export async function sendLeadMessage(leadId: number, body: string, imageUrl = ""): Promise<InboxMessage> {
  const { data, error, response } = await _post(`${LEADS_BASE}/${leadId}/messages`, {
    body: { body, image_url: imageUrl },
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to send message."));
  return data as InboxMessage;
}

export async function sendLeadQuote(
  leadId: number,
  lineItems: InboxQuoteLineItem[],
  isInvoice = false,
): Promise<InboxQuote> {
  const { data, error, response } = await _post(`${LEADS_BASE}/${leadId}/quotes`, {
    body: { line_items: lineItems, is_invoice: isInvoice },
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to send quote."));
  return data as InboxQuote;
}

export async function acceptQuote(quoteId: number): Promise<InboxQuote> {
  const { data, error, response } = await _post(`${LEADS_BASE}/quotes/${quoteId}/accept`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to accept quote."));
  return data as InboxQuote;
}

export async function archiveLead(leadId: number): Promise<InboxLead> {
  const { data, response } = await _post(`${LEADS_BASE}/${leadId}/archive`);
  if (!data) throw new ApiError(response.status, "Failed to archive.");
  return data as InboxLead;
}

export async function completeLead(leadId: number): Promise<InboxLead> {
  const { data, response } = await _post(`${LEADS_BASE}/${leadId}/complete`);
  if (!data) throw new ApiError(response.status, "Failed to mark complete.");
  return data as InboxLead;
}

export async function acceptRequest(leadId: number): Promise<InboxLead> {
  const { data, error, response } = await _post(`${LEADS_BASE}/${leadId}/accept-request`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to accept request."));
  return data as InboxLead;
}

export async function createAnonymousLead(payload: {
  pro_id: number;
  job_title: string;
  detail?: string;
}): Promise<{ id: number; status: string }> {
  const { data, error, response } = await _post(`${LEADS_BASE}/anonymous`, { body: payload });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to submit request."));
  return data as { id: number; status: string };
}

export async function searchPros(params: {
  q?: string;
  trade?: string;
  zip?: string;
  node?: string;
}): Promise<ProOut[]> {
  const q: Record<string, string> = {};
  if (params.q) q.q = params.q;
  if (params.trade) q.trade = params.trade;
  if (params.zip) q.zip = params.zip;
  if (params.node) q.node = params.node;
  const qs = Object.keys(q).length ? `?${new URLSearchParams(q).toString()}` : "";
  const { data, response } = await _get(`/api/pros${qs}`);
  if (!data) throw new ApiError(response.status, "Failed to search pros.");
  return data as ProOut[];
}

export async function searchProsPublic(params: {
  q?: string;
  trade?: string;
  zip?: string;
  radius?: number;
  category?: string;
  subcategory?: string;
  licensed?: boolean;
  insured?: boolean;
  max_response_hours?: number;
  min_krafts?: number;
  min_recs?: number;
}): Promise<ProOut[]> {
  const q: Record<string, string> = {};
  if (params.q) q.q = params.q;
  if (params.trade) q.trade = params.trade;
  if (params.zip) q.zip = params.zip;
  if (params.radius != null) q.radius = String(params.radius);
  if (params.category) q.category = params.category;
  if (params.subcategory) q.subcategory = params.subcategory;
  if (params.licensed) q.licensed = "true";
  if (params.insured) q.insured = "true";
  if (params.max_response_hours != null) q.max_response_hours = String(params.max_response_hours);
  if (params.min_krafts != null) q.min_krafts = String(params.min_krafts);
  if (params.min_recs != null) q.min_recs = String(params.min_recs);
  const qs = Object.keys(q).length ? `?${new URLSearchParams(q).toString()}` : "";
  const { data, response } = await client.GET(`/api/pros/search${qs}` as never);
  if (!data) throw new ApiError(response.status, "Failed to search pros.");
  return data as ProOut[];
}

export async function submitZipWaitlist(payload: { zip: string; contact: string }): Promise<void> {
  const { response } = await client.POST("/api/leads/zip-waitlist" as never, { body: payload } as never);
  if (!response.ok) throw new ApiError(response.status, "Failed to submit waitlist entry.");
}

export interface GeoZipOut {
  zip: string;
  city: string;
  state: string;
}

export async function fetchGeoZip(): Promise<GeoZipOut | null> {
  try {
    const { data } = await client.GET("/api/public/geo/zip" as never);
    return (data as unknown as GeoZipOut) ?? null;
  } catch {
    return null;
  }
}

export interface LocationInfoOut {
  zip: string;
  city: string;
  state: string;
  pros_count: number;
}

export async function getLocationInfo(zip: string): Promise<LocationInfoOut | null> {
  try {
    const { data } = await client.GET(`/api/public/location/${zip}` as never);
    return (data as unknown as LocationInfoOut) ?? null;
  } catch {
    return null;
  }
}

export interface RfqPayload {
  description: string;
  category: string;
  subcategory?: string;
  timeline: "this_week" | "next_month" | "just_planning";
  zip_code: string;
  budget?: string;
  requester_name: string;
  requester_contact: string;
}

export async function submitRfq(payload: RfqPayload): Promise<{ id: number; matched_pro_count: number }> {
  const res = await fetch("/api/pros/rfq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (err as { detail?: string }).detail ?? "Failed to submit request.");
  }
  return res.json() as Promise<{ id: number; matched_pro_count: number }>;
}

// ── Favorites ────────────────────────────────────────────────────────────────

async function _favFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

export async function getFavoritePros(): Promise<{ pro_ids: number[] }> {
  const res = await _favFetch("/api/favorites/pros");
  if (!res.ok) throw new ApiError(res.status, "Failed to fetch favorites.");
  return res.json() as Promise<{ pro_ids: number[] }>;
}

export async function syncFavoritePros(pro_ids: number[]): Promise<{ pro_ids: number[] }> {
  const res = await _favFetch("/api/favorites/pros/sync", {
    method: "POST",
    body: JSON.stringify({ pro_ids }),
  });
  if (!res.ok) throw new ApiError(res.status, "Failed to sync favorites.");
  return res.json() as Promise<{ pro_ids: number[] }>;
}

export async function toggleFavoritePro(pro_id: number): Promise<{ favorited: boolean; pro_ids: number[] }> {
  const res = await _favFetch(`/api/favorites/pros/${pro_id}/toggle`, { method: "POST" });
  if (!res.ok) throw new ApiError(res.status, "Failed to toggle favorite.");
  return res.json() as Promise<{ favorited: boolean; pro_ids: number[] }>;
}

export async function claimAnonymousLead(leadId: number): Promise<InboxLead> {
  const { data, error, response } = await _post(`${LEADS_BASE}/${leadId}/claim`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to claim lead."));
  return data as InboxLead;
}

export function trackSitePageView(url: string): void {
  const referrer = document.referrer || "";
  const cleanUrl = url.split("?")[0].split("#")[0];
  void _post("/api/track/page-view", { body: { url: cleanUrl, referrer } });
}

// ── GK Admin Inbox Platform View ──────────────────────────────────────────────

export interface InboxUserRow {
  id: number;
  name: string;
  email: string | null;
  role: string;
  lead_count: number;
  message_count: number;
}

export interface InboxUserListOut {
  total: number;
  items: InboxUserRow[];
}

export async function getGkInboxOverview(params?: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<InboxUserListOut> {
  const q: Record<string, string> = {};
  if (params?.search) q.search = params.search;
  if (params?.page) q.page = String(params.page);
  if (params?.page_size) q.page_size = String(params.page_size);
  const qs = Object.keys(q).length ? `?${new URLSearchParams(q).toString()}` : "";
  const { data, response } = await _get(`/api/gk-admin/inbox/overview${qs}`);
  if (!data) throw new ApiError(response.status, "Failed to load inbox overview.");
  return data as InboxUserListOut;
}

export async function getGkInboxUserLeads(userId: number): Promise<InboxLead[]> {
  const { data, response } = await _get(`/api/gk-admin/inbox/user/${userId}`);
  if (!data) throw new ApiError(response.status, "Failed to load user threads.");
  return data as InboxLead[];
}

// ---------- Referrer — activity, followers, requests, invites ----------

export async function getReferrerDashboard(): Promise<ReferrerDashboardOut> {
  const { data, response } = await _get("/api/referrer/me/dashboard");
  if (!data) throw new ApiError(response.status, "Failed to load referrer dashboard.");
  return data as ReferrerDashboardOut;
}

export async function getReferrerActivity(
  page = 1,
  pageSize = 20,
): Promise<{ total: number; results: ReferralSentSummaryOut[] }> {
  const { data, response } = await _get(
    `/api/referrer/me/activity?page=${page}&page_size=${pageSize}`,
  );
  if (!data) throw new ApiError(response.status, "Failed to load activity.");
  return data as { total: number; results: ReferralSentSummaryOut[] };
}

export async function getReferrerFollowers(
  page = 1,
  pageSize = 20,
): Promise<{ total: number; results: FollowerOut[] }> {
  const { data, response } = await _get(
    `/api/referrer/me/followers?page=${page}&page_size=${pageSize}`,
  );
  if (!data) throw new ApiError(response.status, "Failed to load followers.");
  return data as { total: number; results: FollowerOut[] };
}

export async function getReferrerRequests(
  status = "pending",
): Promise<ReferralRequestDetailOut[]> {
  const { data, response } = await _get(`/api/referrer/me/requests?status=${status}`);
  if (!data) throw new ApiError(response.status, "Failed to load requests.");
  return data as ReferralRequestDetailOut[];
}

export async function declineReferrerRequest(id: number): Promise<void> {
  await _post(`/api/referrer/me/requests/${id}/decline`);
}

export async function sendReferralRequest(
  id: number,
  body: { referrer_pro_id: number; note_to_follower: string; note_to_pro: string },
): Promise<{ otp_required?: boolean; message?: string }> {
  const { data, error, response } = await _post(`/api/referrer/me/requests/${id}/send`, { body });
  if (!response.ok) throw new ApiError(response.status, detailOf(error, "Failed to send."));
  return (data ?? {}) as { otp_required?: boolean; message?: string };
}

export async function verifyFollowerOtp(
  id: number,
  otp: string,
): Promise<{ verified?: boolean; error?: string }> {
  const { data, error, response } = await _post(
    `/api/referrer/me/requests/${id}/verify-follower-otp`,
    { body: { otp } },
  );
  if (!response.ok) throw new ApiError(response.status, detailOf(error, "OTP check failed."));
  return (data ?? {}) as { verified?: boolean; error?: string };
}

export async function getInviteList(): Promise<InviteListOut> {
  const { data, response } = await _get("/api/referrer/me/invites");
  if (!data) throw new ApiError(response.status, "Failed to load invites.");
  return data as InviteListOut;
}

export async function createProInvite(payload: {
  name: string;
  phone: string;
  email?: string;
  note?: string;
  channel?: string;
  message?: string;
}): Promise<{ invite_id: number; referrer_pro_id: number; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post("/api/referrer/me/invite-pro", { body: payload });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create invite."));
  return data as { invite_id: number; referrer_pro_id: number; token: string; referrer_slug: string };
}

export async function createFriendInvite(payload: {
  name: string;
  phone: string;
  email?: string;
  channel?: string;
  message?: string;
}): Promise<{ invite_id: number; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post("/api/referrer/me/invite-friend-single", {
    body: payload,
  });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create friend invite."));
  return data as { invite_id: number; token: string; referrer_slug: string };
}

export async function createCircleShare(payload: {
  name: string;
  phone?: string;
  email?: string;
  channel?: string;
  message?: string;
}): Promise<{ invite_id: number; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post("/api/referrer/me/share-circle", { body: payload });
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create circle share."));
  return data as { invite_id: number; token: string; referrer_slug: string };
}

export async function resendProInvite(
  id: number,
): Promise<{ ok: boolean; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post(`/api/referrer/me/invite-pro/${id}/resend`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to resend."));
  return data as { ok: boolean; token: string; referrer_slug: string };
}

export async function resendFriendInvite(
  id: number,
): Promise<{ ok: boolean; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post(
    `/api/referrer/me/invite-friend-single/${id}/resend`,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to resend."));
  return data as { ok: boolean; token: string; referrer_slug: string };
}

export async function archiveProInvite(id: number): Promise<void> {
  await _post(`/api/referrer/me/invite-pro/${id}/archive`);
}

export async function archiveFriendInvite(id: number): Promise<void> {
  await _post(`/api/referrer/me/invite-friend-single/${id}/archive`);
}

export async function resendCircleShare(
  id: number,
): Promise<{ ok: boolean; token: string; referrer_slug: string }> {
  const { data, error, response } = await _post(`/api/referrer/me/share-circle/${id}/resend`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to resend."));
  return data as { ok: boolean; token: string; referrer_slug: string };
}

export async function archiveCircleShare(id: number): Promise<void> {
  await _post(`/api/referrer/me/share-circle/${id}/archive`);
}

export async function getInviteContactTimeline(
  scenario: InviteScenario,
  inviteId: number,
): Promise<InviteTimelineEventOut[]> {
  const { data, response } = await _get(`/api/referrer/me/invites/${scenario}/${inviteId}/timeline`);
  if (!response.ok) throw new ApiError(response.status, "Failed to load timeline.");
  return (data ?? []) as InviteTimelineEventOut[];
}

export interface CircleAddNoticeOut {
  id: number;
  referrer_name: string;
  referrer_slug: string;
  referrer_avatar_url: string;
  is_read: boolean;
  created_at: string;
}

export async function listCircleNotices(): Promise<CircleAddNoticeOut[]> {
  const { data, response } = await _get("/api/pros/me/circle-notices");
  if (!response.ok) throw new ApiError(response.status, "Failed to load circle notices.");
  return (data ?? []) as CircleAddNoticeOut[];
}

export async function markCircleNoticeRead(id: number): Promise<void> {
  await _post(`/api/pros/me/circle-notices/${id}/read`);
}

export async function updateProInvite(
  id: number,
  patch: { name?: string; phone?: string; email?: string },
): Promise<InviteListProOut> {
  const { data, error, response } = await client.PATCH(`/api/referrer/me/invite-pro/${id}` as never, {
    body: patch,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update invite."));
  return data as InviteListProOut;
}

export async function updateFriendInvite(
  id: number,
  patch: { name?: string; phone?: string; email?: string },
): Promise<InviteListFriendOut> {
  const { data, error, response } = await client.PATCH(
    `/api/referrer/me/invite-friend-single/${id}` as never,
    { body: patch } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update invite."));
  return data as InviteListFriendOut;
}

export async function claimProInvite(token: string): Promise<void> {
  const { error, response } = await _post(`/api/referrer/pro-invite/claim/${token}`);
  if (!response.ok) throw new ApiError(response.status, detailOf(error, "Failed to claim invite."));
}

export async function claimFriendInvite(token: string): Promise<void> {
  const { error, response } = await _post(`/api/referrer/friend-invite/claim/${token}`);
  if (!response.ok) throw new ApiError(response.status, detailOf(error, "Failed to claim friend invite."));
}

