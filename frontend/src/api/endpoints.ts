import { client } from "./client";
import type { components } from "./generated/types";

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

export async function patchMe(body: { role?: string; first_name?: string; last_name?: string }): Promise<UserOut> {
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

// ---------- Prospects ----------

export interface StepJourney {
  step: number;
  sent_at: string | null;
  channel: string | null;  // "email" | "whatsapp" | null
  read_at: string | null;  // non-null = email was opened (pixel fired)
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

export async function advanceProspectStep(id: number): Promise<Prospect> {
  const { data, error, response } = await client.POST(
    `/api/prospects/${id}/advance-step` as never,
    {} as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to advance step."));
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

export interface OutreachLog {
  id: number;
  channel: string;
  to_address: string;
  cc_addresses: string;
  subject_sent: string;
  body_sent: string;
  resend_id: string;
  notes: string;
  sent_at: string;
  template_id: number | null;
  template_name: string | null;
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

export async function claimAnonymousLead(leadId: number): Promise<InboxLead> {
  const { data, error, response } = await _post(`${LEADS_BASE}/${leadId}/claim`);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to claim lead."));
  return data as InboxLead;
}

