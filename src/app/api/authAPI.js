import axiosClient from "./axiosClient";

/**
 * Register a new business owner.
 * @param {{ firstName: string, lastName: string, businessName: string, businessType: string, email: string, phone: string, password: string }} payload
 * @returns {{ message: string, token: string, user: object }}
 */
export const registerUser = (payload) =>
  axiosClient.post("/auth/register", payload).then((res) => res.data);

/**
 * Login an existing user.
 * Provide either `email` or `phone` as the identifier.
 * @param {{ email?: string, phone?: string, password: string }} payload
 * @returns {{ message: string, token: string, user: object }}
 */
export const loginUser = (payload) =>
  axiosClient.post("/auth/login", payload).then((res) => res.data);

/**
 * Send an OTP to a phone number for verification.
 * @param {{ phone: string }} payload
 * @returns {{ message: string, otp?: string }}
 */
export const sendOtp = (payload) =>
  axiosClient.post("/auth/send-otp", payload).then((res) => res.data);

/**
 * Verify the OTP for a phone number.
 * @param {{ phone: string, otp: string }} payload
 * @returns {{ message: string, verified: boolean }}
 */
export const verifyOtp = (payload) =>
  axiosClient.post("/auth/verify-otp", payload).then((res) => res.data);

// Get the currently logged-in user's profile
export const getProfile = () =>
  axiosClient.get("/auth/profile").then((res) => res.data);

// Update the currently logged-in user's profile
export const updateProfile = (payload) =>
  axiosClient.put("/auth/profile", payload).then((res) => res.data);

// Change password for currently logged-in user
export const changePassword = (payload) =>
  axiosClient.put("/auth/change-password", payload).then((res) => res.data);

// Verify 2FA OTP on login
export const verifyLoginOtp = (payload) =>
  axiosClient.post("/auth/verify-login-otp", payload).then((res) => res.data);

// Request password reset OTP
export const forgotPassword = (payload) =>
  axiosClient.post("/auth/forgot-password", payload).then((res) => res.data);

// Verify Reset OTP (Step 2)
export const verifyResetOtp = (payload) =>
  axiosClient.post("/auth/verify-reset-otp", payload).then((res) => res.data);

// Reset password with OTP
export const resetPassword = (payload) =>
  axiosClient.post("/auth/reset-password", payload).then((res) => res.data);
