import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LandingPage from "./pages/public/LandingPage";
import AuthScreen from "./pages/public/AuthScreen";
import AppShell from "./AppShell";
import {
  CustomizationProvider,
  applyDOMCustomization,
} from "./context/CustomizationContext";
import { NotificationProvider } from "./context/NotificationContext";
import {
  FeaturesPage, PricingPage, AboutPage, BlogPage, 
  CareersPage, HelpCenterPage, StatusPage, ContactPage
} from "./pages/public/FooterPages";
import { useCustomization } from "./hooks/useCustomization";
import { setUserToStorage } from "./utils/userUtils";
import { AccountingProvider } from "./context/AccountingContext";

const APP_PAGES = [
  "dashboard",
  "super-dashboard",
  "businesses",
  "revenue",
  "customers",
  "suppliers",
  "products",
  "pos",
  "sales",
  "billing",
  "sales-billing",
  "purchase",
  "inventory",
  "reports",
  "expenses",
  "users",
  "settings",
  "notifications",
  "profile",
];

function getPageFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "app") return null;
  const pageKey = segments[1];
  if (pageKey === "sales" || pageKey === "billing" || pageKey === "sales-billing") {
    return "pos";
  }
  return APP_PAGES.includes(pageKey) ? pageKey : "dashboard";
}

function ThemeRouteManager() {
  const location = useLocation();
  const { tempSettings } = useCustomization();

  useEffect(() => {
    const isAppRoute = location.pathname.startsWith("/app");
    applyDOMCustomization(tempSettings, isAppRoute);
  }, [location.pathname, tempSettings]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("smartbill_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => user?.role || "owner");
  const [page, setPage] = useState(() => {
    const routePage = getPageFromPath(location.pathname);
    return (
      routePage ?? (role === "superadmin" ? "super-dashboard" : "dashboard")
    );
  });

  useEffect(() => {
    const routePage = getPageFromPath(location.pathname);

    if (location.pathname === "/app") {
      setPage(role === "superadmin" ? "super-dashboard" : "dashboard");
      return;
    }

    if (routePage) setPage(routePage);
  }, [location.pathname, role]);

  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = localStorage.getItem("smartbill_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
          if (parsed.role) setRole(parsed.role);
        }
      } catch {}
    };

    // On initial app mount / page refresh, fetch authoritative profile from backend
    const token = localStorage.getItem("smartbill_token");
    if (token) {
      import("./api/authAPI").then(({ getProfile }) => {
        getProfile()
          .then((res) => {
            if (res?.user) {
              setUser(res.user);
              if (res.user.role) setRole(res.user.role);
              setUserToStorage(res.user);
            }
          })
          .catch((err) => {
            console.warn("Global profile reload notice:", err.message);
          });
      });
    }

    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogin = (r, u) => {
    setRole(r);
    if (u) {
      setUser(u);
    } else {
      try {
        const raw = localStorage.getItem("smartbill_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {}
    }
    setPage(r === "superadmin" ? "super-dashboard" : "dashboard");
    navigate("/app");
  };

  const handleLogout = () => {
    localStorage.removeItem("smartbill_token");
    localStorage.removeItem("smartbill_user");
    setUser(null);
    setPage("dashboard");
    applyDOMCustomization(null, false);
    navigate("/");
  };

  const navAuth = useCallback(
    (v) => {
      if (v === "landing") navigate("/");
      else navigate(`/${v}`);
    },
    [navigate],
  );

  const navApp = useCallback(
    (p) => {
      const targetPage =
        p === "sales" || p === "billing" || p === "sales-billing" ? "pos" : p;
      setPage(targetPage);
      if (targetPage === "dashboard" || targetPage === "super-dashboard") {
        navigate("/app");
      } else {
        navigate(`/app/${targetPage}`);
      }
    },
    [navigate],
  );

  return (
    <NotificationProvider onNav={navApp}>
      <ThemeRouteManager />
      <Routes>
        <Route path="/" element={<LandingPage onNav={navAuth} />} />
        <Route
          path="/login"
          element={
            <AuthScreen view="login" onNav={navAuth} onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            <AuthScreen view="register" onNav={navAuth} onLogin={handleLogin} />
          }
        />
        <Route
          path="/forgot"
          element={<AuthScreen view="forgot" onNav={navAuth} />}
        />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/app"
          element={
            <AppShell
              role={role}
              user={user}
              onLogout={handleLogout}
              page={page}
              onNav={navApp}
            />
          }
        />
        <Route
          path="/app/:pageKey"
          element={
            <AppShell
              role={role}
              user={user}
              onLogout={handleLogout}
              page={page}
              onNav={navApp}
            />
          }
        />
        <Route path="*" element={<LandingPage onNav={navAuth} />} />
      </Routes>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <CustomizationProvider>
      <AccountingProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AccountingProvider>
    </CustomizationProvider>
  );
}
