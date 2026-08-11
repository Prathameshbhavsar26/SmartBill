import axiosClient from "./axiosClient";

/**
 * Fetch all products for the logged-in user.
 * @returns {{ products: Array }}
 */
export const getProducts = () =>
  axiosClient.get("/products").then((res) => res.data);

/**
 * Fetch a single product by id.
 * @param {string} id
 * @returns {{ product: object }}
 */
export const getProductById = (id) =>
  axiosClient.get(`/products/${id}`).then((res) => res.data);

/**
 * Create a new product.
 * @param {object} payload product fields
 * @returns {{ message: string, product: object }}
 */
export const createProduct = (payload) =>
  axiosClient.post("/products", payload).then((res) => res.data);

/**
 * Update an existing product.
 * @param {string} id
 * @param {object} payload updated product fields
 * @returns {{ message: string, product: object }}
 */
export const updateProduct = (id, payload) =>
  axiosClient.put(`/products/${id}`, payload).then((res) => res.data);

/**
 * Delete a product by id.
 * @param {string} id
 * @returns {{ message: string }}
 */
export const deleteProduct = (id) =>
  axiosClient.delete(`/products/${id}`).then((res) => res.data);
