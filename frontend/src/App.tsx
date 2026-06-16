import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";
import { useAuth } from "./auth/AuthContext";

// Layouts
import { AdminShell } from "./layout/AdminShell";
import { GkAdminShell } from "./layout/GkAdminShell";
import { ProShell } from "./layout/ProShell";
import { HomeShell } from "./layout/HomeShell";

// Public pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./features/public/RegisterPage";
import { ReviewPage } from "./features/public/ReviewPage";
import { ProPublicProfilePage } from "./features/public/ProPublicProfilePage";

// GK Admin pages (super-admin, cross-node)
import { GkAdminDashboardPage } from "./features/gk-admin/GkAdminDashboardPage";
import { GkAdminUsersPage } from "./features/gk-admin/GkAdminUsersPage";
import { GkAdminNodesPage } from "./features/gk-admin/GkAdminNodesPage";
import { GkAdminSafetyPage } from "./features/gk-admin/GkAdminSafetyPage";
import { GkAdminVendorsPage } from "./features/gk-admin/GkAdminVendorsPage";
import { GkAdminStripePage } from "./features/gk-admin/GkAdminStripePage";

// Admin pages
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { AdminTriagePage } from "./features/admin/AdminTriagePage";
import { AdminSafetyPage } from "./features/admin/AdminSafetyPage";
import { AdminProsPage } from "./features/admin/AdminProsPage";
import { AdminKraftsPage } from "./features/admin/AdminKraftsPage";
import { AdminSettingsPage } from "./features/admin/AdminSettingsPage";

// Pro pages
import { ProKraftEditorPage, KraftPublicPreviewPage } from "./features/pro/ProKraftEditorPage";
import { ProKraftListPage } from "./features/pro/ProKraftListPage";
import { ProReviewsPage } from "./features/pro/ProReviewsPage";
import { ProStatsPage } from "./features/pro/ProStatsPage";
import { ProNetworkPage } from "./features/pro/ProNetworkPage";
import { ProBillingPage } from "./features/pro/ProBillingPage";
import { ProAccountPage } from "./features/pro/ProAccountPage";

import { ProServiceAreaPage } from "./features/pro/ProServiceAreaPage";
import { ProProfilePage } from "./features/pro/ProProfilePage";
import { ProOnboardingPage } from "./features/pro/onboarding/ProOnboardingPage";

// Homeowner pages
import { HomeOnboardingPage } from "./features/home/HomeOnboardingPage";
import { HomeDiscoverPage } from "./features/home/HomeDiscoverPage";
import { HomeProProfilePage } from "./features/home/HomeProProfilePage";
import { HomeEmergencyPage } from "./features/home/HomeEmergencyPage";
import { HomeMessagesPage } from "./features/home/HomeMessagesPage";
import { HomeAccountPage } from "./features/home/HomeAccountPage";
import { HomeRecommendPage } from "./features/home/HomeRecommendPage";

function RoleRedirect() {
  const { user, status } = useAuth();
  if (status === "loading") return null;
  if (!user) return <Navigate to="/login" replace />;
  const redirects: Record<string, string> = {
    pro: "/pro/reviews",
    homeowner: "/home/discover",
    node_manager: "/admin/dashboard",
    gk_admin: "/gk-admin/dashboard",
  };
  return <Navigate to={redirects[user.role] ?? "/admin/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/review/:handle/:token" element={<ReviewPage />} />
      <Route path="/pros/:id" element={<ProPublicProfilePage />} />

      {/* Role-based root redirect */}
      <Route path="/" element={<RequireAuth><RoleRedirect /></RequireAuth>} />

      {/* GK Admin (super-admin, cross-node) */}
      <Route
        path="/gk-admin"
        element={
          <RequireAuth>
            <RequireRole role="gk_admin">
              <GkAdminShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/gk-admin/dashboard" replace />} />
        <Route path="dashboard" element={<GkAdminDashboardPage />} />
        <Route path="users" element={<GkAdminUsersPage />} />
        <Route path="nodes" element={<GkAdminNodesPage />} />
        <Route path="safety" element={<GkAdminSafetyPage />} />
        <Route path="vendors" element={<GkAdminVendorsPage />} />
        <Route path="stripe" element={<GkAdminStripePage />} />
      </Route>

      {/* Admin (node_manager) */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole role="node_manager">
              <AdminShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="triage" element={<AdminTriagePage />} />
        <Route path="safety" element={<AdminSafetyPage />} />
        <Route path="pros" element={<AdminProsPage />} />
        <Route path="krafts" element={<AdminKraftsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Pro */}
      <Route
        path="/pro"
        element={
          <RequireAuth>
            <RequireRole role="pro">
              <ProShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/pro/reviews" replace />} />
        <Route path="reviews" element={<ProReviewsPage />} />
        <Route path="reviews/:id" element={<ProReviewsPage />} />
        <Route path="krafts" element={<ProKraftListPage />} />
        <Route path="krafts/new" element={<ProKraftEditorPage />} />
        <Route path="krafts/:id" element={<ProKraftEditorPage />} />
        <Route path="krafts/:id/preview" element={<KraftPublicPreviewPage />} />
        <Route path="stats" element={<ProStatsPage />} />
        <Route path="network" element={<ProNetworkPage />} />
        <Route path="billing" element={<ProBillingPage />} />
        <Route path="profile" element={<Navigate to="/pro/account?tab=public" replace />} />
        <Route path="account" element={<ProAccountPage />} />
        <Route path="account/service-area" element={<ProServiceAreaPage />} />
        <Route path="account/profile" element={<ProProfilePage />} />
      </Route>

      {/* Pro onboarding — outside ProShell (full-bleed wallpaper) */}
      <Route
        path="/pro/onboarding"
        element={<RequireAuth><RequireRole role="pro"><ProOnboardingPage /></RequireRole></RequireAuth>}
      />

      {/* Homeowner onboarding — outside HomeShell (full-bleed wallpaper) */}
      <Route
        path="/home/onboarding"
        element={<RequireAuth><RequireRole role="homeowner"><HomeOnboardingPage /></RequireRole></RequireAuth>}
      />

      {/* Homeowner */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <RequireRole role="homeowner">
              <HomeShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/home/discover" replace />} />
        <Route path="discover" element={<HomeDiscoverPage />} />
        <Route path="pros/:id" element={<HomeProProfilePage />} />
        <Route path="emergency" element={<HomeEmergencyPage />} />
        <Route path="messages" element={<HomeMessagesPage />} />
        <Route path="messages/:leadId" element={<HomeMessagesPage />} />
        <Route path="recommend" element={<HomeRecommendPage />} />
        <Route path="account" element={<HomeAccountPage />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
