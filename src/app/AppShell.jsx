import { useState } from "react";
import Revenue from "./pages/admin/Revenue";
import BusinessesNew from "./pages/admin/BusinessesNew";
import Sidebar from "./layouts/Sidebar";
import Topbar from "./layouts/Topbar";
import { notifications } from "./data/mockData";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import BusinessDashboard from "./pages/dashboard/BusinessDashboard";
import CustomersScreen from "./pages/commerce/CustomersScreen";
import SuppliersScreen from "./pages/commerce/SuppliersScreen";
import ProductsScreen from "./pages/commerce/ProductsScreen";
import POSScreen from "./pages/transactions/POSScreen";
import PurchaseScreen from "./pages/transactions/PurchaseScreen";
import InventoryScreen from "./pages/transactions/InventoryScreen";
import ReportsScreen from "./pages/reports/ReportsScreen";
import ExpensesScreen from "./pages/transactions/ExpensesScreen";
import UsersScreen from "./pages/users/UsersScreen";
import SuperAdminSettingsScreen from "./pages/admin/SuperAdminSettingsScreen";
import SettingsScreen from "./pages/settings/SettingsScreen";
import NotificationsScreen from "./pages/users/NotificationsScreen";
import ProfileScreen from "./pages/settings/ProfileScreen";

export default function AppShell({ role, onLogout, page, onNav }) {
  const [collapsed, setCollapsed] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const renderPage = () => {
    switch (page) {
      case "super-dashboard":
        return <SuperAdminDashboard />;
      case "businesses":
        return <BusinessesNew />;
      case "dashboard":
        return <BusinessDashboard onNav={onNav} />;
      case "customers":
        return <CustomersScreen />;
      case "suppliers":
        return <SuppliersScreen />;
      case "products":
        return <ProductsScreen />;
      case "revenue":
        return <Revenue />;
      case "pos":
        return <POSScreen />;
      case "purchase":
        return <PurchaseScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "reports":
        return <ReportsScreen />;
      case "expenses":
        return <ExpensesScreen />;
      case "users":
        return <UsersScreen />;
      case "settings":
        return role === "superadmin" ? (
          <SuperAdminSettingsScreen />
        ) : (
          <SettingsScreen />
        );
      case "notifications":
        return <NotificationsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <BusinessDashboard onNav={onNav} />;
    }
  };

  return (
    <div
      className="flex h-screen bg-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Sidebar
        page={page}
        onNav={onNav}
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          page={page}
          onLogout={onLogout}
          onNav={onNav}
          role={role}
          notifCount={unread}
        />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
