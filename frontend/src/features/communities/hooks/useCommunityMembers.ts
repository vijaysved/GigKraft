import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import { communityFetch } from "./useCommunity";
import type { CommunityMemberOut } from "../types";

export function useCommunityMembers() {
  const [members, setMembers] = useState<CommunityMemberOut[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communityFetch("/api/me/community/members");
      if (res.ok) setMembers(await res.json() as CommunityMemberOut[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  async function addMembers(rows: { name: string; phone: string; email: string }[]) {
    const res = await communityFetch("/api/me/community/members", {
      method: "POST",
      body: JSON.stringify({ members: rows }),
    });
    const body = await res.json() as { added?: number; skipped?: number; detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not add members.");
    await refetch();
    return body;
  }

  async function uploadCsv(file: File) {
    const form = new FormData();
    form.append("file", file);
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/api/me/community/members/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const body = await res.json() as { added?: number; skipped?: number; detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not upload contacts.");
    await refetch();
    return body;
  }

  async function resendInvite(memberId: number) {
    const res = await communityFetch(`/api/me/community/members/${memberId}/resend`, { method: "POST" });
    const body = await res.json() as { detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not resend invite.");
    await refetch();
  }

  async function removeMember(memberId: number) {
    const res = await communityFetch(`/api/me/community/members/${memberId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Could not remove member.");
    await refetch();
  }

  async function setRole(memberId: number, role: "moderator" | "member") {
    const res = await communityFetch(`/api/me/community/members/${memberId}/role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    const body = await res.json() as { detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not change role.");
    await refetch();
  }

  async function approveMember(memberId: number) {
    const res = await communityFetch(`/api/me/community/members/${memberId}/approve`, { method: "POST" });
    const body = await res.json() as { detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not approve this request.");
    await refetch();
  }

  async function declineMember(memberId: number) {
    const res = await communityFetch(`/api/me/community/members/${memberId}/decline`, { method: "POST" });
    const body = await res.json() as { detail?: string };
    if (!res.ok) throw new Error(body.detail ?? "Could not decline this request.");
    await refetch();
  }

  return { members, loading, refetch, addMembers, uploadCsv, resendInvite, removeMember, setRole, approveMember, declineMember };
}
