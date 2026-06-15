import { client } from "./client";
import type { components } from "./generated/types";

export type RecommendationOut = components["schemas"]["RecommendationOut"];
export type ReviewContextOut  = components["schemas"]["ReviewContextOut"];

// ── Metric definitions ────────────────────────────────────────────────────────
export const REC_METRICS = [
  { key: "punctuality",       label: "Punctuality" },
  { key: "communication",     label: "Communication" },
  { key: "cleanliness",       label: "Cleanliness" },
  { key: "clear_rates",       label: "Clear rates" },
  { key: "written_estimates", label: "Written estimates" },
  { key: "material_policy",   label: "Material policy" },
] as const;

export type RecMetricKey = typeof REC_METRICS[number]["key"];
export type RecMetrics   = Record<RecMetricKey, boolean>;

export const DEFAULT_METRICS: RecMetrics = {
  punctuality:       false,
  communication:     false,
  cleanliness:       false,
  clear_rates:       false,
  written_estimates: false,
  material_policy:   false,
};

// ── Metric encode / decode (stored inside the text field) ─────────────────────
const METRIC_SEP = "§";

export function encodeRecText(metrics: RecMetrics, text: string): string {
  return `${METRIC_SEP}${JSON.stringify(metrics)}${METRIC_SEP}\n${text}`;
}

export function decodeRecText(raw: string): { metrics: RecMetrics | null; text: string } {
  const re = new RegExp(`^${METRIC_SEP}(.+?)${METRIC_SEP}\n([\\s\\S]*)$`);
  const match = raw.match(re);
  if (!match) return { metrics: null, text: raw };
  try {
    return { metrics: JSON.parse(match[1]) as RecMetrics, text: match[2] };
  } catch {
    return { metrics: null, text: raw };
  }
}

// ── Revision message thread (localStorage — needs backend endpoint) ───────────
export interface RecMessage {
  from:    "pro" | "reviewer";
  text:    string;
  sentAt:  string; // ISO
}

function messagesKey(recId: number) { return `rec-messages-${recId}`; }

export function loadMessages(recId: number): RecMessage[] {
  try {
    return JSON.parse(localStorage.getItem(messagesKey(recId)) ?? "[]") as RecMessage[];
  } catch { return []; }
}

export function saveMessage(recId: number, msg: RecMessage): RecMessage[] {
  const msgs = [...loadMessages(recId), msg];
  localStorage.setItem(messagesKey(recId), JSON.stringify(msgs));
  return msgs;
}

// ── API wrappers ──────────────────────────────────────────────────────────────
export async function requestRecommendation(body: {
  client_name: string;
  client_contact: string;
  channel: string;
}): Promise<RecommendationOut> {
  const { data, error, response } = await client.POST("/api/recommendations/request", { body });
  if (!data) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
  return data;
}

export async function getReviewContext(token: string): Promise<ReviewContextOut> {
  const { data, error, response } = await client.GET("/api/recommendations/review/{token}", {
    params: { path: { token } },
  });
  if (!data) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
  return data;
}

export async function submitReview(token: string, body: {
  stars: number;
  text: string;
  photo_urls: string[];
}): Promise<void> {
  const { error, response } = await client.POST("/api/recommendations/review/{token}", {
    params: { path: { token } },
    body,
  });
  if (error) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
}

export async function listRecommendations(status?: string): Promise<RecommendationOut[]> {
  const { data, error, response } = await client.GET("/api/recommendations", {
    params: status ? { query: { status } } : undefined,
  } as never);
  if (!data) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
  return data;
}

export async function approveRecommendation(id: number): Promise<RecommendationOut> {
  const { data, error, response } = await client.POST("/api/recommendations/{rec_id}/approve", {
    params: { path: { rec_id: id } },
  });
  if (!data) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
  return data;
}

export async function hideRecommendation(id: number): Promise<void> {
  const { error, response } = await client.POST("/api/recommendations/{rec_id}/hide", {
    params: { path: { rec_id: id } },
  });
  if (error) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
}

export type PublicRecOut = {
  id: number;
  client_name: string;
  stars: number | null;
  text: string;
  submitted_at: string | null;
};

export async function getPublicRecommendations(handle: string): Promise<PublicRecOut[]> {
  const { data, error, response } = await client.GET("/api/recommendations/by-handle/{handle}", {
    params: { path: { handle } },
  });
  if (!data) throw new Error((error as { detail?: string })?.detail ?? `${response.status}`);
  return data as PublicRecOut[];
}
