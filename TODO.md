# Project Restructuring Plan

## Phase 1: Create Directory Structure

- Create pages/commerce/ (Products, Customers, Suppliers)
- Create pages/transactions/ (POS, Purchase, Inventory, Expenses)
- Create pages/dashboard/ (BusinessDashboard, SuperAdminDashboard)
- Create pages/admin/ (Businesses, BusinessesNew, Revenue, SuperAdminSettings)
- Create pages/public/ (LandingPage, AuthScreen)
- Create pages/settings/ (SettingsScreen, ProfileScreen)
- Create pages/users/ (UsersScreen, NotificationsScreen)
- Create pages/reports/ (all report screens)
- Create layouts/ (Sidebar, Topbar, navConfig)

## Phase 2: Move Files

- Move pages to subdirectories
- Move components/layout/ to layouts/
- Move components/revenue.jsx to pages/admin/
- Move businesses-related files to pages/admin/

## Phase 3: Update Import Paths

- Update AppShell.jsx
- Update AppRouter.jsx
- Update all moved page files

## Phase 4: Clean Up

- Remove App.jsx.backup
- Verify all imports work
