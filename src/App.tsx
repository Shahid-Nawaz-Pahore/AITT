import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AIRiskMinimizationPage from "./pages/AIRiskMinimizationPage";
import ComplianceDashboardPage from "./pages/ComplianceDashboardPage";
import CybersecurityAIAssistantPage from "./pages/CybersecurityAIAssistantPage";
import CybersecurityDashboardPage from "./pages/CybersecurityDashboardPage";
import DocumentLibraryPage from "./pages/DocumentLibraryPage";
import HomePage from "./pages/HomePage";
import LLMChatPage from "./pages/LLMChatPage";
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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: DocumentLibraryPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compliance",
  component: ComplianceDashboardPage,
});

const verificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verification",
  component: VerificationPage,
});

const llmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-assistant",
  component: LLMChatPage,
});

const cybersecurityDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cybersecurity",
  component: CybersecurityDashboardPage,
});

const cybersecurityAIRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cybersecurity-assistant",
  component: CybersecurityAIAssistantPage,
});

const aiRiskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-risk",
  component: AIRiskMinimizationPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  libraryRoute,
  dashboardRoute,
  verificationRoute,
  llmRoute,
  cybersecurityDashboardRoute,
  cybersecurityAIRoute,
  aiRiskRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
