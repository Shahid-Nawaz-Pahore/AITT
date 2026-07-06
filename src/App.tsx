import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { DemoBanner } from "./components/DemoBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Protected } from "./components/Protected";
import { AuthProvider } from "./context/AuthContext";
import type { Role } from "./mock/types";
import AIRiskMinimizationPage from "./pages/AIRiskMinimizationPage";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";
import AdminExpertsPage from "./pages/AdminExpertsPage";
import AdminFrameworksPage from "./pages/AdminFrameworksPage";
import CertificatePage from "./pages/CertificatePage";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import ComplianceDashboardPage from "./pages/ComplianceDashboardPage";
import CreateProposalPage from "./pages/CreateProposalPage";
import DocumentReviewPage from "./pages/DocumentReviewPage";
import CybersecurityAIAssistantPage from "./pages/CybersecurityAIAssistantPage";
import CybersecurityDashboardPage from "./pages/CybersecurityDashboardPage";
import DocumentLibraryPage from "./pages/DocumentLibraryPage";
import GovernanceDashboardPage from "./pages/GovernanceDashboardPage";
import GovernanceSettingsPage from "./pages/GovernanceSettingsPage";
import HomePage from "./pages/HomePage";
import LLMChatPage from "./pages/LLMChatPage";
import MonitoringPage from "./pages/MonitoringPage";
import MyDocumentsPage from "./pages/MyDocumentsPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import ProposalDetailPage from "./pages/ProposalDetailPage";
import RegisterPage from "./pages/RegisterPage";
import RegistryPage from "./pages/RegistryPage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import SignInPage from "./pages/SignInPage";
import SubmitDocumentPage from "./pages/SubmitDocumentPage";
import TemplatesPage from "./pages/TemplatesPage";
import VerificationPage from "./pages/VerificationPage";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const route = (path: string, component: () => ReactNode) =>
  createRoute({ getParentRoute: () => rootRoute, path, component });

// Wrap a page in a role guard (enforced in real mode, permissive in mock mode).
const guard =
  (roles: Role[], Component: () => ReactNode): (() => ReactNode) =>
  () => (
    <Protected roles={roles}>
      <Component />
    </Protected>
  );

// Mark a legacy ICP-demo screen (no backend) with a "not connected" banner.
const demo =
  (Component: () => ReactNode): (() => ReactNode) =>
  () => (
    <>
      <DemoBanner />
      <Component />
    </>
  );

// --- Real public screens ---
const indexRoute = route("/", HomePage);
const verificationRoute = route("/verification", VerificationPage);

// --- Legacy ICP-demo screens (no backend; banner-marked — see D8) ---
const libraryRoute = route("/library", demo(DocumentLibraryPage));
const dashboardRoute = route("/compliance", demo(ComplianceDashboardPage));
const llmRoute = route("/ai-assistant", demo(LLMChatPage));
const cybersecurityDashboardRoute = route("/cybersecurity", demo(CybersecurityDashboardPage));
const cybersecurityAIRoute = route("/cybersecurity-assistant", demo(CybersecurityAIAssistantPage));
const aiRiskRoute = route("/ai-risk", demo(AIRiskMinimizationPage));

// --- Auth (Phase 1) ---
const signInRoute = route("/signin", SignInPage);
const registerRoute = route("/register", RegisterPage);

// --- Public + Company (Phase 2) ---
const registryRoute = route("/registry", RegistryPage);
const certificateRoute = route("/certificate/$id", CertificatePage);
const companyRoute = route("/company", guard(["company"], CompanyDashboardPage));
const companySubmitRoute = route("/company/submit", guard(["company"], SubmitDocumentPage));
const companyDocsRoute = route("/company/documents", guard(["company"], MyDocumentsPage));
const companyTemplatesRoute = route("/company/templates", guard(["company"], TemplatesPage));

// --- Sub-Admin (Phase 3) ---
const expertRoute = route("/expert", guard(["sub_admin"], ReviewQueuePage));
const expertReviewRoute = route("/expert/review/$id", guard(["sub_admin"], DocumentReviewPage));
const expertHistoryRoute = route("/expert/history", guard(["sub_admin"], MyReviewsPage));

// --- Main Admin (Phase 4) ---
const adminRoute = route("/admin", guard(["admin"], AdminDashboardPage));
const adminDocsRoute = route("/admin/documents", guard(["admin"], AdminDocumentsPage));
const adminCompaniesRoute = route("/admin/companies", guard(["admin"], AdminCompaniesPage));
const adminExpertsRoute = route("/admin/experts", guard(["admin"], AdminExpertsPage));
const adminCertificatesRoute = route("/admin/certificates", guard(["admin"], AdminCertificatesPage));
const adminFrameworksRoute = route("/admin/frameworks", guard(["admin"], AdminFrameworksPage));

// --- Governance (Phase 5) ---
// NOTE on route precedence: TanStack Router ranks static segments above dynamic
// ones, so "/admin/governance/new" and "/admin/governance/settings" always win
// over "/admin/governance/$id" regardless of registration order.
const governanceRoute = route("/admin/governance", guard(["admin"], GovernanceDashboardPage));
const governanceNewRoute = route("/admin/governance/new", guard(["admin"], CreateProposalPage));
const governanceSettingsRoute = route("/admin/governance/settings", guard(["admin"], GovernanceSettingsPage));
const governanceDetailRoute = route("/admin/governance/$id", guard(["admin"], ProposalDetailPage));

// --- Monitoring (Phase 6) ---
const monitoringRoute = route("/admin/monitoring", guard(["admin"], MonitoringPage));

const routeTree = rootRoute.addChildren([
  indexRoute,
  libraryRoute,
  dashboardRoute,
  verificationRoute,
  llmRoute,
  cybersecurityDashboardRoute,
  cybersecurityAIRoute,
  aiRiskRoute,
  signInRoute,
  registerRoute,
  registryRoute,
  certificateRoute,
  companyRoute,
  companySubmitRoute,
  companyDocsRoute,
  companyTemplatesRoute,
  expertRoute,
  expertReviewRoute,
  expertHistoryRoute,
  adminRoute,
  adminDocsRoute,
  adminCompaniesRoute,
  adminExpertsRoute,
  adminCertificatesRoute,
  adminFrameworksRoute,
  governanceRoute,
  governanceNewRoute,
  governanceSettingsRoute,
  governanceDetailRoute,
  monitoringRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}
