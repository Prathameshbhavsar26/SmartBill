import { CustomizationProvider } from "@shared/context/CustomizationContext.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "@shared/components/common/ErrorBoundary.jsx";
import LandingPage from "./pages/LandingPage";
import {
  FeaturesPage, PricingPage, AboutPage, BlogPage, 
  CareersPage, HelpCenterPage, StatusPage, ContactPage
} from "./pages/FooterPages";

import { useEffect } from "react";
import { getCrmUrl } from "@shared/utils/urlUtils.js";

function RedirectToCrm({ path }) {
  useEffect(() => {
    window.location.href = getCrmUrl(path);
  }, [path]);
  return null;
}

function AppRoutes() {
  const navigate = useNavigate();

  const navAuth = (v) => {
    if (v === "landing") navigate("/");
    else if (v === "login") {
       window.location.href = getCrmUrl("/login");
    } else if (v === "register") {
       window.location.href = getCrmUrl("/register");
    } else if (v === "forgot") {
       window.location.href = getCrmUrl("/forgot");
    } else {
       navigate(`/${v}`);
    }
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
      <Route path="/login" element={<RedirectToCrm path="/login" />} />
      <Route path="/register" element={<RedirectToCrm path="/register" />} />
      <Route path="/forgot" element={<RedirectToCrm path="/forgot" />} />
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



