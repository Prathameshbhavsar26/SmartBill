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
 * @param {{ email: string, password: string }} payload
 * @returns {{ message: string, token: string, user: object }}
 */
export const loginUser = (payload) =>
  axiosClient.post("/auth/login", payload).then((res) => res.data);

