import axiosClient from "./axiosClient";

/**
 * Fetch all subscription plans for SuperAdmin.
 */
export const getSubscriptionPlans = () =>
  axiosClient.get("/admin/subscription-plans").then((res) => res.data);

/**
 * Create a new subscription plan.
 */
export const createSubscriptionPlan = (payload) =>
  axiosClient
    .post("/admin/subscription-plans", payload)
    .then((res) => res.data);

/**
 * Update an existing subscription plan.
 */
export const updateSubscriptionPlan = (id, payload) =>
  axiosClient
    .put(`/admin/subscription-plans/${id}`, payload)
    .then((res) => res.data);

/**
 * Delete a subscription plan.
 */
export const deleteSubscriptionPlan = (id) =>
  axiosClient
    .delete(`/admin/subscription-plans/${id}`)
    .then((res) => res.data);