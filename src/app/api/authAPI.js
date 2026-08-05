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
