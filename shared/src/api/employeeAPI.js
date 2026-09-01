import axiosClient from "./axiosClient";

/**
 * Fetch all employees created under the authenticated business owner.
 * @returns {Promise<{ success: boolean, employees: Array }>}
 */
export const fetchEmployees = () =>
  axiosClient.get("/employees").then((res) => res.data);

/**
 * Create a new employee linked to the business owner.
 * @param {object} payload
 * @returns {Promise<{ success: boolean, message: string, employee: object }>}
 */
export const createEmployee = (payload) =>
  axiosClient.post("/employees", payload).then((res) => res.data);

/**
 * Update an existing employee.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<{ success: boolean, message: string, employee: object }>}
 */
export const updateEmployee = (id, payload) =>
  axiosClient.put(`/employees/${id}`, payload).then((res) => res.data);

/**
 * Delete an employee account.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteEmployee = (id) =>
  axiosClient.delete(`/employees/${id}`).then((res) => res.data);



