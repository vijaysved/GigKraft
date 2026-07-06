import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface RequireRoleProps {
  role: string | string[];
  children: React.ReactNode;
}

const ROLE_HOME: Record<string, string> = {
  member: "/member/welcome",
  pro: "/pro/leads",
  homeowner: "/us/me/refer",
  referrer: "/us/me/refer",
  community_lead: "/us/me/refer",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user } = useAuth();
  if (!user) return null;
  const allowed = Array.isArray(role) ? role : [role];
  const hasRole =
    allowed.includes(user.role) ||
    (user.extra_roles ?? []).some((r) => allowed.includes(r));
  if (!hasRole) {
    return <Navigate to={ROLE_HOME[user.role] ?? "/login"} replace />;
  }
  return <>{children}</>;
}
