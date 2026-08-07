# TODO — Email Invoice to Customer on Generation

## Fix: "Failed to create order" when generating invoice
- [x] Fix `Backend/controller/orderController.js` (collision-proof unique invoice numbers)
- [x] Validate `customerId` before customer update to avoid CastError
- [x] Log full error object for easier debugging
- [x] Verify backend compiles (`node --check` passed)
- [x] Restart backend (loaded new transaction-free code on port 5000, PID 8692)
- [x] Update `Backend/.env` with real Gmail App Password (SMTP now authenticates)
- [x] Test invoice generation + email delivery in Sales & Billing (POS)

## Backend
- [x] Add `nodemailer` dependency to `Backend/package.json` (installed)
- [x] Create `Backend/services/emailService.js` (build HTML invoice + send via SMTP)
- [x] Modify `Backend/controller/orderController.js` to email invoice on order creation
- [x] Add email config keys to `.env` and add `.env` to `.gitignore`

## Frontend
- [x] Update `src/app/api/orderAPI.js` (document `emailSent` in response)
- [x] Update `src/app/pages/transactions/POSScreen.jsx` (show email status on invoice view)

## Verification
- [x] Run `npm install` in `Backend/` (nodemailer installed)
- [x] Verify backend compiles (`node --check` passed)
- [x] Verify frontend builds (`npm run build` succeeded)
- [x] SMTP auth verified with new App Password (`SMTP_AUTH_OK: true`)
- [x] Invoice email sent successfully in live test (`INVOICE EMAIL SENT: <f16e716b-...@gmail.com> -> nandinithakare2003@gmail.com`)

## Remaining User Action
- [x] Replace placeholder SMTP credentials in `Backend/.env` (SMTP_USER, SMTP_PASS) with a real Gmail address + App Password to enable actual email delivery.
