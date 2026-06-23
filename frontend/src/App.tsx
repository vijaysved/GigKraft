import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./auth/RequireAuth";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { RequireRole } from "./auth/RequireRole";
import { useAuth } from "./auth/AuthContext";

// Layouts
import { AdminShell } from "./layout/AdminShell";
import { GkAdminShell } from "./layout/GkAdminShell";
import { ProShell } from "./layout/ProShell";
import { HomeShell } from "./layout/HomeShell";

// Marketing site
import { MarketingLayout } from "./components/marketing/MarketingLayout";
import { HomePage } from "./pages/marketing/HomePage";
import { ForProsPage } from "./pages/marketing/ForProsPage";
import { ForClientsPage } from "./pages/marketing/ForClientsPage";
import { TrustGraphPage } from "./pages/marketing/TrustGraphPage";
import { EnterprisePage } from "./pages/marketing/EnterprisePage";
import { PricingPage } from "./pages/marketing/PricingPage";
import { AboutPage } from "./pages/marketing/AboutPage";
import { CareersPage } from "./pages/marketing/CareersPage";
import { ContactPage } from "./pages/marketing/ContactPage";

// Public pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./features/public/RegisterPage";
import { ReviewPage } from "./features/public/ReviewPage";
import { ProPublicProfilePage } from "./features/public/ProPublicProfilePage";

// Member pages
import { MemberWelcomePage } from "./features/member/MemberWelcomePage";
import { MemberComparePage } from "./features/member/MemberComparePage";
import { SubscribePage } from "./features/member/SubscribePage";

// GK Admin pages (super-admin, cross-node)
import { GkAdminDashboardPage } from "./features/gk-admin/GkAdminDashboardPage";
import { GkAdminFeedbackPage } from "./features/gk-admin/GkAdminFeedbackPage";
import { GkAdminUsersPage } from "./features/gk-admin/GkAdminUsersPage";
import { GkAdminNodesPage } from "./features/gk-admin/GkAdminNodesPage";
import { GkAdminSafetyPage } from "./features/gk-admin/GkAdminSafetyPage";
import { GkAdminProspectsPage } from "./features/gk-admin/GkAdminProspectsPage";
import { GkAdminProspectDetailPage } from "./features/gk-admin/GkAdminProspectDetailPage";
import { GkAdminStripePage } from "./features/gk-admin/GkAdminStripePage";
import { GkAdminSiteConfigPage } from "./features/gk-admin/GkAdminSiteConfigPage";

// Admin pages
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { AdminTriagePage } from "./features/admin/AdminTriagePage";
import { AdminSafetyPage } from "./features/admin/AdminSafetyPage";
import { AdminProsPage } from "./features/admin/AdminProsPage";
import { AdminKraftsPage } from "./features/admin/AdminKraftsPage";
import { AdminSettingsPage } from "./features/admin/AdminSettingsPage";
import { AdminInboxPage } from "./features/admin/AdminInboxPage";

// Pro pages
import { ProKraftEditorPage, KraftPublicPreviewPage } from "./features/pro/ProKraftEditorPage";
import { ProKraftListPage } from "./features/pro/ProKraftListPage";
import { ProReviewsPage } from "./features/pro/ProReviewsPage";
import { ProDashboardPage } from "./features/pro/ProDashboardPage";
import { ProNetworkPage } from "./features/pro/ProNetworkPage";
import { ProAccountPage } from "./features/pro/ProAccountPage";
import { ProInboxPage } from "./features/pro/ProInboxPage";
import { ProPaymentSuccessPage } from "./features/pro/ProPaymentSuccessPage";
import { ProBillingTestPage } from "./features/pro/ProBillingTestPage";

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


const ROLE_HOME: Record<string, string> = {
  member: "/member/welcome",
  pro: "/pro/dashboard",
  homeowner: "/home/discover",
  node_manager: "/admin/dashboard",
  gk_admin: "/gk-admin/dashboard",
};

function RootPage() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  if (status === "authenticated" && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? "/member/welcome"} replace />;
  }
  return <MarketingLayout><HomePage /></MarketingLayout>;
}

export default function App() {
  return (
    <>
    <FeedbackWidget />
    <Routes>
      {/* Marketing site (public) — authenticated users redirected to their role home */}
      <Route path="/" element={<RootPage />} />
      <Route path="/for-pros" element={<MarketingLayout><ForProsPage /></MarketingLayout>} />
      <Route path="/for-homeowners" element={<MarketingLayout><ForClientsPage /></MarketingLayout>} />
      <Route path="/trust-graph" element={<MarketingLayout><TrustGraphPage /></MarketingLayout>} />
      <Route path="/enterprise" element={<MarketingLayout><EnterprisePage /></MarketingLayout>} />
      <Route path="/pricing" element={<MarketingLayout><PricingPage /></MarketingLayout>} />
      <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
      <Route path="/careers" element={<MarketingLayout><CareersPage /></MarketingLayout>} />
      <Route path="/contact" element={<MarketingLayout><ContactPage /></MarketingLayout>} />

      {/* Public app pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/review/:handle/:token" element={<ReviewPage />} />
      <Route path="/pros/:id" element={<ProPublicProfilePage />} />

      {/* Member pages — authenticated, any role (page handles non-member redirects) */}
      <Route path="/member/welcome" element={<RequireAuth><MemberWelcomePage /></RequireAuth>} />
      <Route path="/member/compare" element={<MemberComparePage />} />

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
        <Route path="inbox" element={<AdminInboxPage />} />
        <Route path="inbox/:leadId" element={<AdminInboxPage />} />
        <Route path="feedback" element={<GkAdminFeedbackPage />} />
        <Route path="users" element={<GkAdminUsersPage />} />
        <Route path="nodes" element={<GkAdminNodesPage />} />
        <Route path="safety" element={<GkAdminSafetyPage />} />
        <Route path="prospects" element={<GkAdminProspectsPage />} />
        <Route path="prospects/:id" element={<GkAdminProspectDetailPage />} />
        <Route path="stripe" element={<GkAdminStripePage />} />
        <Route path="site-config" element={<GkAdminSiteConfigPage />} />
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
        <Route path="inbox" element={<AdminInboxPage />} />
        <Route path="inbox/:leadId" element={<AdminInboxPage />} />
        <Route path="triage" element={<AdminTriagePage />} />
        <Route path="safety" element={<AdminSafetyPage />} />
        <Route path="pros" element={<AdminProsPage />} />
        <Route path="krafts" element={<AdminKraftsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Pro (members can enter — upgrade banner shown inside ProShell) */}
      <Route
        path="/pro"
        element={
          <RequireAuth>
            <RequireRole role={["pro", "member"]}>
              <ProShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/pro/dashboard" replace />} />
        <Route path="dashboard" element={<ProDashboardPage />} />
        <Route path="inbox" element={<ProInboxPage />} />
        <Route path="inbox/:leadId" element={<ProInboxPage />} />
        <Route path="reviews" element={<ProReviewsPage />} />
        <Route path="reviews/:id" element={<ProReviewsPage />} />
        <Route path="krafts" element={<ProKraftListPage />} />
        <Route path="krafts/new" element={<ProKraftEditorPage />} />
        <Route path="krafts/:id" element={<ProKraftEditorPage />} />
        <Route path="krafts/:id/preview" element={<KraftPublicPreviewPage />} />
        <Route path="stats" element={<Navigate to="/pro/dashboard" replace />} />
        <Route path="network" element={<ProNetworkPage />} />
        <Route path="billing" element={<Navigate to="/pro/account?tab=billing" replace />} />
        <Route path="billing-test" element={<ProBillingTestPage />} />
        <Route path="profile" element={<Navigate to="/pro/account?tab=public" replace />} />
        <Route path="account" element={<ProAccountPage />} />
        <Route path="account/service-area" element={<ProServiceAreaPage />} />
        <Route path="account/profile" element={<ProProfilePage />} />
        {/* Legacy leads routes — redirect to inbox */}
        <Route path="leads" element={<Navigate to="/pro/inbox" replace />} />
        <Route path="leads/:id" element={<Navigate to="/pro/inbox" replace />} />
      </Route>

      {/* Pro full-screen pages — outside ProShell (WallpaperBackground layout) */}
      <Route
        path="/pro/onboarding"
        element={<RequireAuth><RequireRole role="pro"><ProOnboardingPage /></RequireRole></RequireAuth>}
      />
      <Route path="/pro/checkout" element={<Navigate to="/subscribe" replace />} />
      <Route
        path="/subscribe"
        element={<RequireAuth><RequireRole role={["member", "pro"]}><SubscribePage /></RequireRole></RequireAuth>}
      />
      <Route
        path="/pro/billing/success"
        element={<RequireAuth><RequireRole role={["pro", "member"]}><ProPaymentSuccessPage /></RequireRole></RequireAuth>}
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
    </>
  );
}
