import { CustomizationProvider } from "@shared/context/CustomizationContext.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "@shared/components/common/ErrorBoundary.jsx";
import LandingPage from "./pages/LandingPage";
import {
  FeaturesPage, PricingPage, AboutPage, BlogPage, 
  CareersPage, HelpCenterPage, StatusPage, ContactPage
} from "./pages/FooterPages";

import AuthScreen from "@shared/components/AuthScreen.jsx";
import { getCrmUrl, getAdminUrl } from "@shared/utils/urlUtils.js";

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



