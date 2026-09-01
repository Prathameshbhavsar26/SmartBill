import axiosClient from "./axiosClient";

/**
 * Create a purchase entry in the database.
 * Updates stock for purchased products and updates supplier payable balance automatically.
 * @param {object} payload
 * @returns {{ message: string, purchase: object }}
 */
export const createPurchase = (payload) =>
  axiosClient.post("/purchases", payload).then((res) => res.data);

/**
 * Fetch all purchase records for the logged-in user.
 * @returns {{ message: string, purchases: Array }}
 */
export const fetchPurchases = () =>
  axiosClient.get("/purchases").then((res) => res.data);

/**
 * Fetch a single purchase record by ID.
 * @param {string} id
 * @returns {{ message: string, purchase: object }}
 */
export const fetchPurchaseById = (id) =>
  axiosClient.get(`/purchases/${id}`).then((res) => res.data);

/**
 * Mark a purchase as fully paid.
 * @param {string} id
 * @returns {{ message: string, purchase: object }}
 */
export const markPurchaseAsPaid = (id) =>
  axiosClient.put(`/purchases/${id}/mark-paid`).then((res) => res.data);



