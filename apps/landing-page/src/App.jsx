import { lazy, Suspense } from "react";
import { CustomizationProvider } from "@shared/context/CustomizationContext.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "@shared/components/common/ErrorBoundary.jsx";
import LandingPage from "./pages/LandingPage";
import { Loader2 } from "lucide-react";
import { getCrmUrl, getAdminUrl } from "@shared/utils/urlUtils.js";

// Lazy-loaded secondary pages & AuthScreen for fast landing page first contentful paint
const FeaturesPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.BlogPage })));
const CareersPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.CareersPage })));
const HelpCenterPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.HelpCenterPage })));
const StatusPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.StatusPage })));
const ContactPage = lazy(() => import("./pages/FooterPages").then(m => ({ default: m.ContactPage })));
const AuthScreen = lazy(() => import("@shared/components/AuthScreen.jsx"));

function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === "superadmin" || String(role || "").toLowerCase().includes("admin")) {
      window.location.href = getAdminUrl("/admin");
    } else {
      window.location.href = getCrmUrl("/app");
    }
  };

  const navAuth = (v) => {
    if (v === "landing" || v === "") navigate("/");
    else if (v === "login") navigate("/login");
    else if (v === "register") navigate("/register");
    else if (v === "forgot") navigate("/forgot");
    else navigate(`/${v}`);
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage onNav={navAuth} />} />
        <Route path="/features" element={<FeaturesPage onNav={navAuth} />} />
        <Route path="/pricing" element={<PricingPage onNav={navAuth} />} />
        <Route path="/about" element={<AboutPage onNav={navAuth} />} />
        <Route path="/blog" element={<BlogPage onNav={navAuth} />} />
        <Route path="/careers" element={<CareersPage onNav={navAuth} />} />
        <Route path="/help-center" element={<HelpCenterPage onNav={navAuth} />} />
        <Route path="/status" element={<StatusPage onNav={navAuth} />} />
        <Route path="/contact" element={<ContactPage onNav={navAuth} />} />
        <Route path="/login" element={<AuthScreen view="login" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/register" element={<AuthScreen view="register" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/forgot" element={<AuthScreen view="forgot" onNav={navAuth} />} />
        <Route path="/app/login" element={<AuthScreen view="login" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/app/register" element={<AuthScreen view="register" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/app/forgot" element={<AuthScreen view="forgot" onNav={navAuth} />} />
        <Route path="/crm/login" element={<AuthScreen view="login" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/crm/register" element={<AuthScreen view="register" onNav={navAuth} onLogin={handleLogin} />} />
        <Route path="/crm/forgot" element={<AuthScreen view="forgot" onNav={navAuth} />} />
        <Route path="*" element={<LandingPage onNav={navAuth} />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CustomizationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CustomizationProvider>
    </ErrorBoundary>
  );
}



