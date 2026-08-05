// Legacy App.jsx — deprecated.
// All functionality has been split into modular files:
//   - Router:   ./AppRouter.jsx     (entry point used by src/main.jsx)
//   - Shell:    ./AppShell.jsx
//   - Layouts:  ./layouts/Sidebar.jsx, ./layouts/Topbar.jsx
//   - Pages:    ./pages/** (dashboard, admin, commerce, transactions, reports, users, settings, public)
//   - Design:   ./components/common/ui.jsx
//
// This file now simply re-exports App from the modular router so any
// stale import of "./app/App" still resolves correctly.

export { default } from "./AppRouter.jsx";
