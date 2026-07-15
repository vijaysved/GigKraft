import { Center, Loader } from "@mantine/core";
import { Navigate, Route, Routes, useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";

import { RequireAuth } from "./auth/RequireAuth";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { RequireRole } from "./auth/RequireRole";
import { useAuth } from "./auth/AuthContext";
import { ROLE_HOME } from "./auth/roleHome";
import { getAccessToken } from "./api/tokens";
import { API_BASE_URL } from "./config";

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
import { TermsPage } from "./pages/marketing/TermsPage";
import { FaqPage } from "./pages/marketing/FaqPage";

// Public pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./features/public/RegisterPage";
import { ReviewPage } from "./features/public/ReviewPage";
import { ProPublicProfilePage } from "./features/public/ProPublicProfilePage";
import { SearchPage } from "./pages/SearchPage";

// Member pages
import { MemberWelcomePage } from "./features/member/MemberWelcomePage";
import { MemberComparePage } from "./features/member/MemberComparePage";
import { SubscribePage } from "./features/member/SubscribePage";

// GK Admin pages (super-admin, cross-node)
import { GkAdminDashboardPage } from "./features/gk-admin/GkAdminDashboardPage";
import { GkAdminTrafficDetailPage } from "./features/gk-admin/GkAdminTrafficDetailPage";
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

// Circle pages
import { CuratorDashboardPage } from "./features/circles/CuratorDashboardPage";
import { ClaimLeadPage } from "./features/circles/ClaimLeadPage";

// Referrer pages
import { ReferrerShell } from "./layout/ReferrerShell";
import { ReferrerPublicPage } from "./features/referrer/ReferrerPublicPage";
import { ReferrerDashboard } from "./features/referrer/ReferrerDashboard";
import { ReferrerAccountPage } from "./features/referrer/ReferrerAccountPage";
import { ReferrerInboxPage } from "./features/referrer/ReferrerInboxPage";
import { ContactDetailPage } from "./features/referrer/ContactDetailPage";


function CircleSlugRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/us/${slug}/refer`} replace />;
}

/** Resolves the authenticated user's referrer slug then redirects to /us/:slug/:dest */
function MeRedirect({ dest = "home" }: { dest?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { navigate("/login", { replace: true }); return; }

    fetch(`${API_BASE_URL}/api/referrer/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { profile?: { slug?: string } } | null) => {
        const slug = data?.profile?.slug;
        if (!slug) { navigate("/login", { replace: true }); return; }
        // Preserve sub-path: /us/me/account → /us/:slug/account
        const subpath = location.pathname.replace(/^\/us\/me\/?/, "") || dest;
        navigate(`/us/${slug}/${subpath}`, { replace: true });
      })
      .catch(() => navigate("/login", { replace: true }));
  }, []);

  return <Center h="60vh"><Loader /></Center>;
}

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
      <Route path="/terms" element={<MarketingLayout><TermsPage /></MarketingLayout>} />
      <Route path="/faq" element={<MarketingLayout><FaqPage /></MarketingLayout>} />

      {/* Public app pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/review/:handle/:token" element={<ReviewPage />} />
      <Route path="/pros/:id" element={<ProPublicProfilePage />} />
      <Route path="/search" element={<MarketingLayout><SearchPage /></MarketingLayout>} />
      {/* Clean SEO URL — indexable, no noindex; ZIP extracted from path by SearchPage */}
      <Route path="/gigs/:state/:cityzip" element={<MarketingLayout><SearchPage /></MarketingLayout>} />

      {/* Legacy circle URLs — redirect to new referrer URL */}
      <Route path="/circle/:slug" element={<CircleSlugRedirect />} />
      <Route path="/claim/:leadId" element={<ClaimLeadPage />} />

      {/* Referrer public page — no auth shell */}
      <Route path="/us/:slug/refer" element={<ReferrerPublicPage />} />

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
        <Route path="traffic/:slug" element={<GkAdminTrafficDetailPage />} />
        <Route path="inbox" element={<AdminInboxPage />} />
        <Route path="inbox/:leadId" element={<AdminInboxPage />} />
        <Route path="feedback" element={<GkAdminFeedbackPage />} />
        <Route path="users" element={<GkAdminUsersPage />} />
        <Route path="nodes" element={<GkAdminNodesPage />} />
        <Route path="safety" element={<GkAdminSafetyPage />} />
        <Route path="prospects" element={<GkAdminProspectsPage />} />
        <Route path="prospects/:prospectId" element={<GkAdminProspectDetailPage />} />
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
        <Route path="circle" element={<CuratorDashboardPage />} />
        <Route path="account" element={<HomeAccountPage />} />
      </Route>

      {/* /us/me/* — resolve slug then redirect to /us/:slug/* (static beats :slug) */}
      <Route path="/us/me" element={<RequireAuth><MeRedirect /></RequireAuth>} />
      <Route path="/us/me/refer" element={<RequireAuth><MeRedirect dest="home" /></RequireAuth>} />
      <Route path="/us/me/home" element={<RequireAuth><MeRedirect dest="home" /></RequireAuth>} />
      <Route path="/us/me/inbox" element={<RequireAuth><MeRedirect dest="inbox" /></RequireAuth>} />
      <Route path="/us/me/account" element={<RequireAuth><MeRedirect dest="account" /></RequireAuth>} />

      {/* Referrer authenticated dashboard — slug-based URL */}
      <Route
        path="/us/:slug"
        element={
          <RequireAuth>
            <RequireRole role={["referrer", "homeowner", "community_lead"]}>
              <ReferrerShell />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<ReferrerDashboard />} />
        <Route path="contacts/:scenario/:id" element={<ContactDetailPage />} />
        <Route path="inbox" element={<ReferrerInboxPage />} />
        <Route path="inbox/:leadId" element={<ReferrerInboxPage />} />
        <Route path="account" element={<ReferrerAccountPage />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
