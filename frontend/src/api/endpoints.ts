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

export async function getGkNodes(): Promise<GkNodeSummary[]> {
  const { data, error, response } = await client.GET("/api/gk-admin/nodes" as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load nodes."));
  return data as GkNodeSummary[];
}

// ---------- Vendor CRM ----------

export interface VendorContact {
  id: number;
  vendor_id: string;
  business_name: string;
  contact_person: string;
  category: string;
  lead_source: string;
  phone: string;
  email: string;
  nextdoor_profile_url: string;
  status: string;
  preferred_channel: string;
  last_contact_date: string | null;
  notes: string;
  whatsapp_link: string;
  email_link: string;
  created_at: string;
  updated_at: string;
}

export interface VendorIn {
  contact_person: string;
  business_name?: string;
  category?: string;
  lead_source?: string;
  phone?: string;
  email?: string;
  nextdoor_profile_url?: string;
  status?: string;
  preferred_channel?: string;
  last_contact_date?: string | null;
  notes?: string;
}

export async function listVendors(params?: {
  status?: string;
  source?: string;
  search?: string;
}): Promise<VendorContact[]> {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.source) query.source = params.source;
  if (params?.search) query.search = params.search;
  const { data, error, response } = await client.GET("/api/vendors" as never, {
    params: { query },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load vendors."));
  return data as VendorContact[];
}

export async function createVendor(body: VendorIn): Promise<VendorContact> {
  const { data, error, response } = await client.POST("/api/vendors" as never, {
    body,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create vendor."));
  return (data as { id: number } & VendorContact) as VendorContact;
}

export async function updateVendor(
  id: number,
  body: Partial<VendorIn>,
): Promise<VendorContact> {
  const { data, error, response } = await client.PATCH(
    `/api/vendors/${id}` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update vendor."));
  return data as VendorContact;
}

export async function deleteVendor(id: number): Promise<void> {
  const { response } = await client.DELETE(`/api/vendors/${id}` as never);
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete vendor.");
}

export async function bulkUpdateVendorStatus(
  ids: number[],
  status: string,
): Promise<VendorContact[]> {
  const { data, error, response } = await client.POST(
    "/api/vendors/bulk-status" as never,
    { body: { ids, status } } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Bulk update failed."));
  return data as VendorContact[];
}

// ---------- Email Templates ----------

export interface EmailTemplate {
  id: number;
  name: string;
  kind: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateIn {
  name: string;
  kind: string;
  subject: string;
  body: string;
  is_default?: boolean;
}

export interface TemplatePreview {
  subject: string;
  body: string;
  mailto_link: string;
}

export async function listTemplates(kind?: string): Promise<EmailTemplate[]> {
  const query: Record<string, string> = {};
  if (kind) query.kind = kind;
  const { data, error, response } = await client.GET("/api/vendors/templates" as never, {
    params: { query },
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load templates."));
  return data as EmailTemplate[];
}

export async function createTemplate(body: TemplateIn): Promise<EmailTemplate> {
  const { data, error, response } = await client.POST("/api/vendors/templates" as never, {
    body,
  } as never);
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to create template."));
  return (data as { id: number }) as EmailTemplate;
}

export async function updateTemplate(id: number, body: Partial<TemplateIn>): Promise<EmailTemplate> {
  const { data, error, response } = await client.PATCH(
    `/api/vendors/templates/${id}` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to update template."));
  return data as EmailTemplate;
}

export async function deleteTemplate(id: number): Promise<void> {
  const { response } = await client.DELETE(`/api/vendors/templates/${id}` as never);
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete template.");
}

export async function previewTemplate(templateId: number, vendorId: number): Promise<TemplatePreview> {
  const { data, error, response } = await client.GET(
    `/api/vendors/templates/${templateId}/preview/${vendorId}` as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Preview failed."));
  return data as TemplatePreview;
}

// ---------- Vendor Communications ----------

export interface VendorCommunication {
  id: number;
  vendor_id: number;
  template_id: number | null;
  template_name: string | null;
  channel: string;
  subject_sent: string;
  body_sent: string;
  notes: string;
  sent_at: string;
}

export interface CommunicationIn {
  template_id?: number | null;
  channel?: string;
  subject_sent?: string;
  body_sent?: string;
  notes?: string;
  sent_at?: string;
  advance_status?: boolean;
}

export async function listCommunications(vendorId: number): Promise<VendorCommunication[]> {
  const { data, error, response } = await client.GET(
    `/api/vendors/${vendorId}/communications` as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to load communications."));
  return data as VendorCommunication[];
}

export async function logCommunication(vendorId: number, body: CommunicationIn): Promise<VendorCommunication> {
  const { data, error, response } = await client.POST(
    `/api/vendors/${vendorId}/communications` as never,
    { body } as never,
  );
  if (!data) throw new ApiError(response.status, detailOf(error, "Failed to log communication."));
  return (data as { id: number }) as VendorCommunication;
}

export async function deleteCommunication(vendorId: number, commId: number): Promise<void> {
  const { response } = await client.DELETE(
    `/api/vendors/${vendorId}/communications/${commId}` as never,
  );
  if (response.status !== 204) throw new ApiError(response.status, "Failed to delete log entry.");
}

