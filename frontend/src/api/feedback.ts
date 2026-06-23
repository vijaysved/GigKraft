import { API_BASE_URL } from "../config";
import { getAccessToken } from "./tokens";

export interface FeedbackReply {
  id: number;
  text: string;
  author_name: string;
  created_at: string;
}

export interface FeedbackItem {
  id: number;
  ticket_number: string;
  text: string;
  page_url: string;
  status: "open" | "resolved";
  submitter: string | null;
  created_at: string;
  replies: FeedbackReply[];
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function submitFeedback(text: string, page_url: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text, page_url }),
  });
  if (!res.ok) throw new Error("Failed to submit feedback.");
  return res.json();
}

export async function listAllFeedback(status?: string): Promise<FeedbackItem[]> {
  const url = new URL(`${API_BASE_URL}/api/feedback`);
  if (status) url.searchParams.set("status", status);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load feedback.");
  return res.json();
}

export async function listMyFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/feedback/mine`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load your feedback.");
  return res.json();
}

export async function replyToFeedback(feedbackId: number, text: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/reply`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to send reply.");
  return res.json();
}

export async function updateFeedbackStatus(feedbackId: number, status: "open" | "resolved"): Promise<FeedbackItem> {
  const res = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status.");
  return res.json();
}
