import axiosClient from "./axiosClient";

/**
 * Get all expenses.
 */
export const getExpenses = () =>
  axiosClient.get("/expenses").then((res) => res.data);

/**
 * Create a new expense.
 *
 * @param {{
 *   category: string,
 *   description: string,
 *   amount: number,
 *   date: string,
 *   paymentMode: string,
 *   reference?: string,
 *   status: string
 * }} payload
 */
export const createExpense = (payload) =>
  axiosClient.post("/expenses", payload).then((res) => res.data);


