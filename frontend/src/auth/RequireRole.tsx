import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface RequireRoleProps {
  role: string;
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== role) {
    const redirects: Record<string, string> = {
      pro: "/pro/leads",
      homeowner: "/home/discover",
      node_manager: "/admin/dashboard",
      gk_admin: "/gk-admin/dashboard",
    };
    return <Navigate to={redirects[user.role] ?? "/login"} replace />;
  }
  return <>{children}</>;
}
