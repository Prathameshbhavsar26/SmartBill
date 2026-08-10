import axiosClient from "./axiosClient";

/**
 * Fetch all suppliers for the authenticated business owner.
 * @returns {{ message: string, suppliers: Array }}
 */
export const fetchSuppliers = () =>
  axiosClient.get("/suppliers").then((res) => res.data);

/**
 * Fetch a single supplier by id.
 * @param {string} id
 * @returns {{ message: string, supplier: object }}
 */
export const fetchSupplier = (id) =>
  axiosClient.get(`/suppliers/${id}`).then((res) => res.data);

/**
 * Create a new supplier in the database.
 * @param {{ name: string, contact?: string, phone?: string, email?: string, city?: string, gst?: string, openingBalance?: number }} payload
 * @returns {{ message: string, supplier: object }}
 */
export const createSupplier = (payload) =>
  axiosClient.post("/suppliers", payload).then((res) => res.data);

/**
 * Update an existing supplier.
 * @param {string} id
 * @param {object} payload
 * @returns {{ message: string, supplier: object }}
 */
export const updateSupplier = (id, payload) =>
  axiosClient.put(`/suppliers/${id}`, payload).then((res) => res.data);

/**
 * Delete a supplier.
 * @param {string} id
 * @returns {{ message: string }}
 */
export const deleteSupplier = (id) =>
  axiosClient.delete(`/suppliers/${id}`).then((res) => res.data);

