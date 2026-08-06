import axiosClient from "./axiosClient";

<<<<<<< HEAD
export const fetchCustomers = () =>
  axiosClient.get("/customers").then((res) => res.data.customers);

export const createCustomer = (payload) =>
  axiosClient.post("/customers", payload).then((res) => res.data.customer);
=======
/**
 * Fetch all customers for the authenticated business owner.
 * @returns {{ message: string, customers: Array }}
 */
export const fetchCustomers = () =>
  axiosClient.get("/customers").then((res) => res.data);

/**
 * Fetch a single customer by id.
 * @param {string} id
 * @returns {{ message: string, customer: object }}
 */
export const fetchCustomer = (id) =>
  axiosClient.get(`/customers/${id}`).then((res) => res.data);

/**
 * Create a new customer in the database.
 * @param {{ name: string, contact?: string, phone?: string, email?: string, city?: string, gst?: string, openingBalance?: number }} payload
 * @returns {{ message: string, customer: object }}
 */
export const createCustomer = (payload) =>
  axiosClient.post("/customers", payload).then((res) => res.data);

/**
 * Update an existing customer.
 * @param {string} id
 * @param {object} payload
 * @returns {{ message: string, customer: object }}
 */
export const updateCustomer = (id, payload) =>
  axiosClient.put(`/customers/${id}`, payload).then((res) => res.data);

/**
 * Delete a customer.
 * @param {string} id
 * @returns {{ message: string }}
 */
export const deleteCustomer = (id) =>
  axiosClient.delete(`/customers/${id}`).then((res) => res.data);
>>>>>>> 767a4931 (Add customer and order management)
