// Single source of truth for "where does this role land" redirects.
// Must cover every value in backend accounts.models.User.Role — a role
// missing here in both RootPage and MemberWelcomePage can create a
// Navigate <-> Navigate redirect loop between them.
export const ROLE_HOME: Record<string, string> = {
  visitor: "/register",
  member: "/member/welcome",
  pro: "/pro/dashboard",
  homeowner: "/us/me/home",
  referrer: "/us/me/home",
  community_lead: "/us/me/home",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};
