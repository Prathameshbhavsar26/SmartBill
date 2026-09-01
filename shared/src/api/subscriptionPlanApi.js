import axiosClient from "./axiosClient";

/*
|--------------------------------------------------------------------------
| SUPER ADMIN APIs
|--------------------------------------------------------------------------
*/

/**
 * Fetch all subscription plans for SuperAdmin.
 */
export const getSubscriptionPlans = () =>
  axiosClient
    .get("/admin/subscription-plans")
    .then((res) => res.data);


/**
 * Create subscription plan.
 */
export const createSubscriptionPlan = (
  payload
) =>
  axiosClient
    .post(
      "/admin/subscription-plans",
      payload
    )
    .then((res) => res.data);


/**
 * Update subscription plan.
 */
export const updateSubscriptionPlan = (
  id,
  payload
) =>
  axiosClient
    .put(
      `/admin/subscription-plans/${id}`,
      payload
    )
    .then((res) => res.data);


/**
 * Delete subscription plan.
 */
export const deleteSubscriptionPlan = (
  id
) =>
  axiosClient
    .delete(
      `/admin/subscription-plans/${id}`
    )
    .then((res) => res.data);


/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/

/**
 * Fetch active subscription plans.
 *
 * Used by Sign In / Registration / Pricing pages.
 *
 * Does NOT require authentication.
 */
export const getPublicSubscriptionPlans = () =>
  axiosClient
    .get("/subscription-plans")
    .then((res) => res.data);


