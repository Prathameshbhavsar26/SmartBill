# TODO - OTP Verification for Business Registration

## Goal

Add OTP verification to the register business page: a "Send OTP" button beside the phone field, and a "Verify OTP" section that appears below it after clicking Send OTP.

## Backend

- [x] Create OTP model in `Backend/models/verifiy.js`
- [x] Add `sendOtp` and `verifyOtp` functions to `Backend/controller/authcontroller.js`
- [x] Add `/send-otp` and `/verify-otp` routes to `Backend/routes/Auth Routes.js`

## Frontend

- [x] Add `sendOtp` and `verifyOtp` API functions to `src/app/api/authAPI.js`
- [x] Add "Send OTP" button beside phone field in `src/app/pages/public/AuthScreen.jsx`
- [x] Add "Verify OTP" section below phone field (appears after Send OTP clicked)
- [x] Wire verification status into registration flow (registration blocked until phone verified)

## Verify

- [x] Restart backend and test OTP endpoints
  - [x] `POST /api/auth/send-otp` → returns "OTP sent successfully", logs OTP to console
  - [x] `POST /api/auth/verify-otp` (wrong OTP) → 400 "Incorrect OTP"
  - [x] `POST /api/auth/verify-otp` (correct OTP) → 200 "Phone number verified successfully", verified: true
- [ ] Test frontend flow with Vite dev server
