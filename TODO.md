# TODO — Automatic Customer Order Value / Paid / Balance Due Calculation

## Backend
- [x] Create `Backend/models/Customer.js`
- [x] Create `Backend/models/Order.js`
- [x] Create `Backend/middleware/mid.js` (JWT auth `protect`)
- [x] Create `Backend/controller/customerController.js`
- [x] Create `Backend/controller/orderController.js`
- [x] Create `Backend/routes/customerRoutes.js`
- [x] Create `Backend/routes/orderRoutes.js`
- [x] Mount new routes in `Backend/server.js`

## Frontend
- [x] Create `src/app/api/customerAPI.js`
- [x] Create `src/app/api/orderAPI.js`
- [x] Update `src/app/pages/transactions/POSScreen.jsx` (amount paid, balance due, save order)
- [x] Update `src/app/pages/commerce/CustomersScreen.jsx` (load from DB, show order value/paid/balance)
  - [x] Replace `c.id` with `c._id` (table keys, edit, delete)
  - [x] Wire "Add Customer" save button to `handleCreate` (createCustomer API)
  - [x] Wire "Save Changes" edit button to `updateCustomer` API
  - [x] Add `handleDelete` + render `ConfirmDialog` (deleteCustomer API)
  - [x] Replace hardcoded stats cards with dynamic values

## Verification
- [x] Verify backend compiles/runs (all files pass `node --check`)
- [x] Verify frontend builds (`npm run build` succeeded)
