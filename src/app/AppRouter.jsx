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

const APP_PAGES = [
  "dashboard",
  "super-dashboard",
  "businesses",
  "revenue",
  "customers",
  "suppliers",
  "products",
  "pos",
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
  return APP_PAGES.includes(pageKey) ? pageKey : "dashboard";
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState("owner");
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

  const handleLogin = (r) => {
    setRole(r);
    setPage(r === "superadmin" ? "super-dashboard" : "dashboard");
    navigate("/app");
  };

  const handleLogout = () => {
    setPage("dashboard");
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
      if (p === "dashboard" || p === "super-dashboard") navigate("/app");
      else navigate(`/app/${p}`);
    },
    [navigate],
  );

  return (
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
      <Route
        path="/app"
        element={
          <AppShell
            role={role}
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
            onLogout={handleLogout}
            page={page}
            onNav={navApp}
          />
        }
      />
      <Route path="*" element={<LandingPage onNav={navAuth} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
