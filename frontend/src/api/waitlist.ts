import { API_BASE_URL } from "../config";

export type WaitlistUserType = "general" | "pro" | "enterprise";

export interface WaitlistPayload {
  email: string;
  name: string;
  google_sub: string;
  user_type: WaitlistUserType;
  zipcode?: string;
}

export interface WaitlistResult {
  ok: boolean;
  already_registered: boolean;
}

export async function joinWaitlist(payload: WaitlistPayload): Promise<WaitlistResult> {
  const res = await fetch(`${API_BASE_URL}/api/waitlist/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Waitlist request failed");
  return res.json() as Promise<WaitlistResult>;
}

export function decodeGoogleJwt(token: string): { email: string; name: string; sub: string } {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return { email: json.email ?? "", name: json.name ?? "", sub: json.sub ?? "" };
  } catch {
    return { email: "", name: "", sub: "" };
  }
}
