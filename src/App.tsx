import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { RoleProvider } from "./context/RoleContext";
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

// --- Existing reference screens (unchanged) ---
const indexRoute = route("/", HomePage);
const libraryRoute = route("/library", DocumentLibraryPage);
const dashboardRoute = route("/compliance", ComplianceDashboardPage);
const verificationRoute = route("/verification", VerificationPage);
const llmRoute = route("/ai-assistant", LLMChatPage);
const cybersecurityDashboardRoute = route("/cybersecurity", CybersecurityDashboardPage);
const cybersecurityAIRoute = route("/cybersecurity-assistant", CybersecurityAIAssistantPage);
const aiRiskRoute = route("/ai-risk", AIRiskMinimizationPage);

// --- Auth (Phase 1) ---
const signInRoute = route("/signin", SignInPage);
const registerRoute = route("/register", RegisterPage);

// --- Public + Company (Phase 2) ---
const registryRoute = route("/registry", RegistryPage);
const certificateRoute = route("/certificate/$id", CertificatePage);
const companyRoute = route("/company", CompanyDashboardPage);
const companySubmitRoute = route("/company/submit", SubmitDocumentPage);
const companyDocsRoute = route("/company/documents", MyDocumentsPage);
const companyTemplatesRoute = route("/company/templates", TemplatesPage);

// --- Sub-Admin (Phase 3) ---
const expertRoute = route("/expert", ReviewQueuePage);
const expertReviewRoute = route("/expert/review/$id", DocumentReviewPage);
const expertHistoryRoute = route("/expert/history", MyReviewsPage);

// --- Main Admin (Phase 4) ---
const adminRoute = route("/admin", AdminDashboardPage);
const adminDocsRoute = route("/admin/documents", AdminDocumentsPage);
const adminCompaniesRoute = route("/admin/companies", AdminCompaniesPage);
const adminExpertsRoute = route("/admin/experts", AdminExpertsPage);
const adminCertificatesRoute = route("/admin/certificates", AdminCertificatesPage);
const adminFrameworksRoute = route("/admin/frameworks", AdminFrameworksPage);

// --- Governance (Phase 5) ---
// NOTE on route precedence: TanStack Router ranks static segments above dynamic
// ones, so "/admin/governance/new" and "/admin/governance/settings" always win
// over "/admin/governance/$id" regardless of registration order.
const governanceRoute = route("/admin/governance", GovernanceDashboardPage);
const governanceNewRoute = route("/admin/governance/new", CreateProposalPage);
const governanceSettingsRoute = route("/admin/governance/settings", GovernanceSettingsPage);
const governanceDetailRoute = route("/admin/governance/$id", ProposalDetailPage);

// --- Monitoring (Phase 6) ---
const monitoringRoute = route("/admin/monitoring", MonitoringPage);

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
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
      <Toaster />
    </ThemeProvider>
  );
}
